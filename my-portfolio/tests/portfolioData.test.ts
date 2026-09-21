import { describe, it, expect } from "vitest";
import { portfolioData } from "@/data/portfolioData";

describe("portfolioData", () => {
  it("contains valid owner profile and projects", () => {
    expect(portfolioData.profile.name).toBe("Trần Trung Nguyên");
    expect(portfolioData.profile.role).toBeDefined();
    expect(portfolioData.profile.email).toBe("trtrnguyen14104@gmail.com");
    expect(portfolioData.skills.length).toBeGreaterThanOrEqual(5);
    expect(portfolioData.projects.length).toBeGreaterThanOrEqual(3);
    
    portfolioData.projects.forEach((p) => {
      expect(p.id).toBeDefined();
      expect(p.number).toBeDefined();
      expect(p.title).toBeDefined();
      expect(p.subtitle).toBeDefined();
      expect(p.tags).toBeInstanceOf(Array);
      expect(p.description).toBeDefined();
      expect(p.bgColor).toBeDefined();
      expect(p.mockImages.main).toBeDefined();
      expect(p.mockImages.left).toBeDefined();
      expect(p.mockImages.right).toBeDefined();
    });
  });
});
