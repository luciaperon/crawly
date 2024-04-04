export class JenkinsJobResponse<T> {
  isSuccessfull: boolean;
  message: string;
  job?: T;

  constructor(message: string, isSuccessfull: boolean, job: any) {
    this.isSuccessfull = isSuccessfull;
    this.message = message;
    this.job = job;
  }
}
