export class RetriableIdentifier {
  value: string;
  retry: number;

  constructor(value: string) {
    this.value = value;
    this.retry = 0;
  }

  fail(): number {
    return ++this.retry;
  }

  failed(): boolean {
    return this.retry === 3;
  }
}
