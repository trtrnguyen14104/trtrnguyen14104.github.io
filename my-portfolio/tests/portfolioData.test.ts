import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { portfolioData } from "@/data/portfolioData";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const MOCK_SLOTS = ["left", "main", "right"] as const;

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

  it("points every project mock image at a file that exists in public/", () => {
    const broken: string[] = [];

    portfolioData.projects.forEach((p) => {
      MOCK_SLOTS.forEach((slot) => {
        const src = p.mockImages[slot];

        if (!src?.startsWith("/")) {
          broken.push(`${p.id}.${slot} is not a public path: ${src}`);
          return;
        }

        if (!existsSync(path.join(PUBLIC_DIR, src))) {
          broken.push(`${p.id}.${slot} -> ${src}`);
        }
      });
    });

    expect(broken).toEqual([]);
  });

  it("contains a complete professional experience and education history", () => {
    expect(portfolioData.experience.length).toBeGreaterThanOrEqual(1);
    expect(portfolioData.education.length).toBeGreaterThanOrEqual(1);

    portfolioData.experience.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.role).toBeDefined();
      expect(e.company).toBeDefined();
      expect(e.period).toBeDefined();
      expect(e.location).toBeDefined();
      expect(e.summary).toBeDefined();
      expect(e.tech.length).toBeGreaterThan(0);
      expect(e.highlights.length).toBeGreaterThan(0);
    });

    portfolioData.education.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.institution).toBeDefined();
      expect(e.degree).toBeDefined();
      expect(e.period).toBeDefined();
      expect(e.location).toBeDefined();
    });
  });

  it("uses the real screenshots for the AloChat and research projects", () => {
    const alochat = portfolioData.projects.find((p) => p.id === "project-2");
    const research = portfolioData.projects.find((p) => p.id === "project-3");

    expect(alochat?.mockImages).toEqual({
      left: "/pictures/Alochat/alochat-login.webp",
      main: "/pictures/Alochat/alochat-chat.webp",
      right: "/pictures/Alochat/alochat-project-detail.webp",
    });
    expect(research?.mockImages).toEqual({
      left: "/pictures/rdms/rdms-library.webp",
      main: "/pictures/rdms/rdms-home.webp",
      right: "/pictures/rdms/rdms-stats.webp",
    });
  });

  it("uses the real QuizLearn screenshots for the quiz project", () => {
    const quiz = portfolioData.projects.find((p) => p.id === "project-1");

    expect(quiz?.mockImages).toEqual({
      left: "/pictures/quizlearn/quizlearn-library.png",
      main: "/pictures/quizlearn/quizlearn-dashboard.png",
      right: "/pictures/quizlearn/quizlearn-result.png",
    });
  });
});
