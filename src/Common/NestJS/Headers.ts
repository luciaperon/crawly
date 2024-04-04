export class HEADERS {
  static CSV_FILE = (fileName: string): Record<string, string> => {
    return {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${fileName.replace(".csv", "")}.csv`,
    };
  };

  static JSON = {
    "Content-Type": "application/json",
  };

  static TEXT = {
    "Content-Type": "text/plain",
  };

  static JSON_FILE = (fileName: string): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=${fileName.replace(".json", "")}.json`,
    };
  };

  static TEXT_FILE = (fileName: string) => {
    return {
      "Content-Type": "text/txt",
      "Content-Disposition": `attachment; filename=${fileName.replace(".txt", "")}.txt`,
    };
  };
}
