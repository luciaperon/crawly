import fs from "fs";
import { describe, it, expect } from "vitest";
import { ScaleSERPResponse } from "../../src/Models/ScaleSERP/Response";

describe("Test missing fields handling", () => {
  let res: ScaleSERPResponse = ScaleSERPResponse.fromJSON(
    JSON.parse(fs.readFileSync("test/ScaleSERP/resources/respMissingState.json", "utf-8"))
  );

  it("Should skip organic if missing", () => {
    let res: ScaleSERPResponse = ScaleSERPResponse.fromJSON("");

    expect(res.organicResults).toHaveLength(0);
  });

  it("Missing position", () => {
    expect(res.organicResults[0].position).toBe(0);
  });

  it("Missing title", () => {
    expect(res.organicResults[1].title).toBe("-");
  });

  it("Missing link", () => {
    expect(res.organicResults[2].link).toBe("-");
  });

  it("Missing domain", () => {
    expect(res.organicResults[3].domnain).toBe("-");
  });

  it("Missing snippet", () => {
    expect(res.organicResults[5].snippet).toBe("-");
  });
});
