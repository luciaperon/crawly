export class GenericResponse {
  message: string;
  description: string;
  data: any;

  constructor(message: string, description?: string, data?: any) {
    this.message = message;

    if (description) this.description = description;
    if (data) this.data = data;
  }
}
