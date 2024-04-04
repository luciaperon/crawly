import Jenkins from "jenkins";
import { ApplicationException } from "../../Common";
import { JenkinsActiveJob } from "../Crawler/JenkinsActiveJob";

export class JenkinsAPI {
  jenkins: any;

  constructor(apiKey: string) {
    const { JK_URL, JK_USER } = process.env;
    this.jenkins = new Jenkins({
      baseUrl: `https://${JK_USER}:${apiKey}@${JK_URL}`,
    });
  }

  async getJob(jobName: string): Promise<any> {
    return await this.jenkins.job.get(jobName);
  }

  async getBuild(jobName: string, buildId: number): Promise<any> {
    return await this.jenkins.build.get(jobName, buildId);
  }

  async getLogs(jobName: string, buildId: number): Promise<string> {
    return await this.jenkins.build.log(jobName, buildId);
  }

  async stopBuild(jobName: string, buildId: number): Promise<any> {
    return await this.jenkins.build.stop(jobName, buildId);
  }

  async getRunningBuild(requestedJob: string): Promise<any> {
    let job = null;

    if (typeof requestedJob === "string") {
      job = await this.getJob(requestedJob);
    } else {
      job = requestedJob;
    }

    if (!job.lastBuild) {
      return null;
    }

    const build = await this.jenkins.build.get(requestedJob, job.lastBuild.number);

    if (job.queueItem || (build && build.inProgress === true)) {
      return build;
    }

    return null;
  }

  async asureNoRunningVitalJobs() {
    const vitalJobs: string[] = process.env.JK_VITAL_JOBS.split(",").map((x) => x.trim());

    for (const job of vitalJobs) {
      const build = await this.getRunningBuild(job);

      if (build) {
        throw new ApplicationException(
          `Only one of the following jobs can be ran at the same time: [${vitalJobs.join(
            ","
          )}]. Wait until it finishes then try again.`,
          new JenkinsActiveJob(build)
        );
      }
    }
  }

  async build(job: string, parameters: object): Promise<void> {
    await this.jenkins.job.build({
      name: job,
      parameters: parameters,
    });
  }
}
