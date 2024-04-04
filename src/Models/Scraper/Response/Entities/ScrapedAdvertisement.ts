export class ScrapedAdvertisement {
  imgLink: string;
  probability: number;
  associatedHyperlink: string;

  constructor(imgLink: string, probability: number, associatedHyperlink: string) {
    this.imgLink = imgLink;
    this.probability = Number(probability.toFixed(2));
    this.associatedHyperlink = associatedHyperlink;
  }
}
