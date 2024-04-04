import { cleanURL } from ".";

export class Queue<T> {
  queue: T[];

  constructor() {
    this.queue = [];
  }

  pushURL(url: string): void {
    this.queue.push(cleanURL(url) as unknown as T);
  }

  push(value: T): void {
    this.queue.push(value);
  }

  pop(): T {
    return this.queue.pop();
  }

  size(): number {
    return this.queue.length;
  }

  raw(): T[] {
    return this.queue;
  }

  includes(value: T): boolean {
    return this.queue.includes(value);
  }

  clear(): void {
    this.queue = [];
  }
}
