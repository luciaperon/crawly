export class ApplicationException extends Error {
  description: string;
  data: string | object;
  status: number = 400;

  constructor(description: string, data: string | object) {
    super(description);
    this.description = description;
    this.data = data;
  }

  setStatus(status: number): ApplicationException {
    this.status = status;

    return this;
  }
}
