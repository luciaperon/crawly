import { DateTime } from "luxon";
import { Constants } from "../../../Common";

export class SERPListResponse {
  path: string;
  size: string;
  date: string;
  dateMilliseconds: number;

  constructor(path: string, size: number, date: string) {
    this.path = path;
    this.size = size.formatBytes();
    const dateTime: DateTime = DateTime.fromISO(date);
    this.date = dateTime.toFormat(Constants.FULL_DATE_TIME_FORMAT);
    this.dateMilliseconds = dateTime.toMillis();
  }
}
