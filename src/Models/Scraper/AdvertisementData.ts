import { expandURL } from "../../Common";

export class AdvertisementData {
  src: string;
  height: number;
  width: number;
  classList: DOMTokenList;
  probability: number;
  parent: {
    tag: string;
    target: string;
    href: string;
  };

  constructor(obj: AdvertisementData) {
    this.src = obj.src;
    this.height = obj.height;
    this.width = obj.width;
    this.classList = obj.classList;
    this.probability = obj.probability;
    this.parent = obj.parent;

    if (this.parent.href) {
      this.parent.href = expandURL(this.parent.href);
    }
  }
}
