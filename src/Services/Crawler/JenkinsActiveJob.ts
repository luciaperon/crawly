export class JenkinsActiveJob {
  isRunning: boolean;
  duration: number;
  displayName: string;
  url: string;

  constructor(jenkinsResponse) {
    this.isRunning = jenkinsResponse.inProgress;
    this.duration = jenkinsResponse.duration;
    this.displayName = jenkinsResponse.fullDisplayName;
    this.url = jenkinsResponse.url;
  }
}
