import { csvJoin } from "../../../../Common";
import { ICSVSerializable } from "../../../../Common/CSVSerializer/ICSVSerializable";

export class DeadPageResponse implements ICSVSerializable {
  url: string;
  isDead: boolean;
  isForSale: boolean;
  isUnsecure: boolean;

  constructor(url: string, isDead: boolean, isForSale: boolean, isUnsecure: boolean) {
    this.url = url;
    this.isDead = isDead;
    this.isForSale = isForSale;
    this.isUnsecure = isUnsecure;
  }

  serializeAsCSV(): string {
    let csv: string[][] = [];

    csv.push(["URL", "IS DEAD", "IS FOR SALE", "IS UNSECURE"]);
    csv.push([
      this.url,
      this.isDead ? "True" : "False",
      this.isForSale ? "True" : "False",
      this.isUnsecure ? "True" : "False",
    ]);

    let formatted = csv.map((x) => csvJoin(x));

    return formatted.join("\n");
  }
}
