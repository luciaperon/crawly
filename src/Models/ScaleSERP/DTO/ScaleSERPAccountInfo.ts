export class ScaleSERPAccountInfo {
  name: string;
  email: string;
  plan: string;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  creditsResetAt: string;

  constructor(res) {
    this.name = res["account_info"]["name"] || "Not found.";
    this.email = res["account_info"]["email"] || "Not found.";
    this.plan = res["account_info"]["plan"] || "Not found.";
    this.creditsUsed = res["account_info"]["credits_used"] || 0;
    this.creditsLimit = res["account_info"]["credits_limit"] || 0;
    this.creditsRemaining = res["account_info"]["credits_remaining"] || 0;
    this.creditsResetAt = res["account_info"]["credits_reset_at"] || "";
  }
}
