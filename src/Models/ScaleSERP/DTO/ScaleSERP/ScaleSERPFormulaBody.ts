import { ScaleSERPBaseBody } from "./ScaleSERPBaseBody";

export class ScaleSERPFormulaBody extends ScaleSERPBaseBody {
  url: string;

  constructor(formula: string, numOfResults: number, location: string) {
    super(numOfResults.toString(), location);
    this.url = formula;
  }
}
