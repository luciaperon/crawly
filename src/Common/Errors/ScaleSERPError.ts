export class ScaleSERPError {
  message: string | object;
  description: string;

  constructor(message: string | object, description: string) {
    this.message = message;
    this.description = description;
  }
}
