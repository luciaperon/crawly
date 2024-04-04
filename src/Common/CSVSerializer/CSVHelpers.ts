import Papa, { ParseResult } from "papaparse";
import { CSVParseError } from "../../Models/SERP/DTO/CSVParseErrors";

export class CSVHelpers {
  static extractSeparator(csvString: string): string {
    let i = 0;

    while (i != csvString.length) {
      if (csvString[i] === "," || csvString[i] === ";" || csvString[i] === "\t" || csvString[i] === "|") {
        return csvString[i];
      }

      ++i;
    }

    return null;
  }

  static parseCSV(csvString: string, columnName: string): ParsedData {
    let parsedData: ParseResult<string> = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    let errors: CSVParseError[] = parsedData.errors;

    if (!parsedData.meta.fields || parsedData.meta.fields.length === 0) {
      errors.push(
        new CSVParseError(
          0,
          "Header",
          "UndetectableHeader",
          `Couldn't find header in file. First line contains data.`,
          csvString.split("\n")[0]
        )
      );

      return new ParsedData(null, errors);
    }

    let delimiter: string = parsedData.meta.delimiter;

    if (!delimiter) {
      delimiter = this.extractSeparator(csvString);

      if (delimiter) {
        errors = errors.filter((x) => x.type !== "Delimiter");
      } else {
        return new ParsedData(null, errors);
      }
    }

    const columnIndex: number = parsedData.meta.fields.indexOf(columnName);

    if (columnIndex === -1) {
      errors.push(
        new CSVParseError(
          0,
          "FieldMismatch",
          "UndetectableDataColumn",
          `Couldn't find column '${columnName}' in headers.`,
          `Found headers: [${parsedData.meta.fields.join(",")}]`
        )
      );
      return new ParsedData(null, errors);
    }

    return new ParsedData(
      parsedData.data.map((x) => Object.values(x)[columnIndex]),
      parsedData.errors
    );
  }
}

export class ParsedData {
  data: string[];
  parseErrors: CSVParseError[];

  constructor(data: string[], parseErrors: CSVParseError[]) {
    this.data = data;
    this.parseErrors = parseErrors;
  }
}
