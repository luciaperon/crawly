import { ScaleSERPBaseBody } from "./ScaleSERPBaseBody";

export class ScaleSERPQueryBody extends ScaleSERPBaseBody {
  q: string;

  constructor(query: string, numOfResults: number, location: string) {
    super(numOfResults.toString(), location);
    this.q = query;
  }
}
