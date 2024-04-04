import puppeteer from "puppeteer-extra";
import { Browser, Page } from "puppeteer";
import { anonymizeProxy } from "proxy-chain";
import randomUseragent from "random-useragent";
import { ApplicationException } from "./Errors";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export class PuppeteerInstance {
  private DEFAULT_USER_AGENT = "Chrome/63.0.3239.132";
  private DEFAULT_BROWSER_ARGS = [
    "--lang=en",
    "--autoplay-policy=user-gesture-required",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-setuid-sandbox",
    "--disable-speech-api",
    "--disable-sync",
    "--hide-scrollbars",
    "--ignore-gpu-blacklist",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pings",
    "--no-sandbox",
    "--no-zygote",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
    "--disable-infobars",
    "--window-position=0,0",
    "--ignore-certifcate-errors",
    "--ignore-certifcate-errors-spki-list",
  ];

  browser: Browser;
  currentPage: Page;
  proxy: boolean;
  userAgent: string;

  constructor(useProxy: boolean) {
    this.proxy = useProxy;
    puppeteer.use(StealthPlugin());
  }

  randomizeUserAgent(): string {
    this.userAgent = randomUseragent.getRandom() || this.DEFAULT_USER_AGENT;
    return this.userAgent;
  }

  async initializeBrowser(): Promise<PuppeteerInstance> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: this.DEFAULT_BROWSER_ARGS,
      ignoreHTTPSErrors: true,
      dumpio: false,
    });

    return this;
  }

  private async randomizeBrowser() {
    await this.currentPage.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 3000 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    await this.currentPage.setExtraHTTPHeaders({
      "Accept-Language": "en",
    });
    await this.currentPage.setUserAgent(await this.randomizeUserAgent());
    await this.currentPage.setJavaScriptEnabled(true);
    await this.currentPage.setBypassCSP(true);
    await this.currentPage.setExtraHTTPHeaders({
      Referer: "https://www.google.com/",
    });

    this.currentPage.setDefaultNavigationTimeout(0);
  }

  async getCurrentPage(): Promise<Page> {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const tabs = await this.browser.pages();
    this.currentPage = tabs.length > 0 ? tabs[0] : await this.browser.newPage();

    await this.randomizeBrowser();

    return this.currentPage;
  }

  async goto(url: string, timeout: number, options?: any): Promise<Page> {
    try {
      if (!this.browser) {
        await this.initializeBrowser();
      }
      this.currentPage = await this.getCurrentPage();

      await this.currentPage.goto(url, options ? options : { waitUntil: "networkidle2", timeout: 160000 });
      await this.currentPage.addStyleTag({ content: "{scroll-behavior: auto !important;}" });

      await this.currentPage.waitForTimeout(timeout);
      await this.currentPage.bringToFront();

      return this.currentPage;
    } catch (err) {
      if (err.name === "ProtocolError") {
        throw new ApplicationException(
          err.message,
          "URL that you entered is not valid.Protocol is required ('https://' or 'http://') while 'www' is not."
        );
      }

      throw err;
    }
  }

  async gracefullyClose(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
