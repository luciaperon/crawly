export class CollectionResponse<T> {
  data: T[];

  constructor(data: T[]) {
    this.data = data;
  }
}
