export class CrawlerError extends Error {
  userInitiated: boolean;
  message: string;

  constructor(userInitiated: boolean, message: string) {
    super(message);
    this.userInitiated = userInitiated;
    this.message = message;
  }
}
