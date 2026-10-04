import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ExperienceContent } from "@/components/windows/ExperienceContent";
import { portfolioData } from "@/data/portfolioData";

describe("ExperienceContent Component", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the experience and education sections", () => {
    render(<ExperienceContent />);

    expect(screen.getByText(/my journey/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /where i have worked/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /where i studied/i })
    ).toBeInTheDocument();
  });

  it("renders every experience entry with role, company, period and highlights", () => {
    render(<ExperienceContent />);

    expect(portfolioData.experience.length).toBeGreaterThanOrEqual(1);

    portfolioData.experience.forEach((item) => {
      const card = screen.getByTestId(`experience-item-${item.id}`);

      expect(
        within(card).getByRole("heading", { name: item.role })
      ).toBeInTheDocument();
      expect(within(card).getByText(item.company)).toBeInTheDocument();
      expect(within(card).getByText(item.period)).toBeInTheDocument();
      expect(within(card).getByText(item.location)).toBeInTheDocument();
      expect(within(card).getByText(item.summary)).toBeInTheDocument();

      item.highlights.forEach((highlight) => {
        expect(within(card).getByText(highlight)).toBeInTheDocument();
      });

      item.tech.forEach((tech) => {
        expect(within(card).getByText(tech)).toBeInTheDocument();
      });
    });
  });

  it("flags the current role", () => {
    render(<ExperienceContent />);

    const current = portfolioData.experience.find((item) => item.isCurrent);
    expect(current).toBeDefined();

    const card = screen.getByTestId(`experience-item-${current!.id}`);
    expect(within(card).getByText(/current/i)).toBeInTheDocument();
  });

  it("renders education entries", () => {
    render(<ExperienceContent />);

    portfolioData.education.forEach((item) => {
      const card = screen.getByTestId(`education-item-${item.id}`);
      expect(
        within(card).getByRole("heading", { name: item.institution })
      ).toBeInTheDocument();
      expect(within(card).getByText(item.degree)).toBeInTheDocument();
      expect(within(card).getByText(item.period)).toBeInTheDocument();
      expect(within(card).getByText(item.location)).toBeInTheDocument();
    });
  });

  it("links the closing call to action to the profile email", () => {
    render(<ExperienceContent />);

    const cta = screen.getByRole("link", { name: /email/i });
    expect(cta).toHaveAttribute(
      "href",
      `mailto:${portfolioData.profile.email}`
    );
  });
});