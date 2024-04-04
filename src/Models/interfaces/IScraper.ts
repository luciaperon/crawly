export interface IScraper<T> {
  scrape(): Promise<T>;
}
