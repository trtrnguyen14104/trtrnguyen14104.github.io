import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutMeContent } from "@/components/windows/AboutMeContent";
import { portfolioData } from "@/data/portfolioData";

describe("AboutMeContent Component", () => {
  it("renders hero greeting, subtitle, and pixel mouse cursor", () => {
    render(<AboutMeContent />);

    // Groovy yellow cursive title
    expect(screen.getByText(/hi, its Nguyen!/i)).toBeInTheDocument();

    // Lime/yellow script subtitle
    expect(screen.getByText(/what i do/i)).toBeInTheDocument();

    // Pixel mouse cursor
    const mouseCursor = screen.getByAltText(/cursor/i);
    expect(mouseCursor).toBeInTheDocument();
    expect(mouseCursor).toHaveAttribute("src", "/icons/Windows_mouse.png");
  });

  it("renders portrait image with proper alt text and src", () => {
    render(<AboutMeContent />);

    const portrait = screen.getByAltText(/Trần Trung Nguyên/i);
    expect(portrait).toBeInTheDocument();
    expect(portrait).toHaveAttribute("src", portfolioData.profile.avatar);
  });

  it("renders profile details: name, role, location, and status", () => {
    render(<AboutMeContent />);

    expect(screen.getAllByText(portfolioData.profile.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(portfolioData.profile.role).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Ho Chi Minh City/i)).toBeInTheDocument();
    expect(screen.getByText(/Open to work/i)).toBeInTheDocument();
  });

  it("renders action buttons: LinkedIn, GitHub, and Email", () => {
    render(<AboutMeContent />);

    const githubLink = screen.getByRole("link", { name: /GitHub/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", portfolioData.profile.github);

    const linkedinLink = screen.getByRole("link", { name: /LinkedIn/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute("href", portfolioData.profile.linkedin);

    const emailLink = screen.getByRole("link", { name: /Email/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", `mailto:${portfolioData.profile.email}`);
  });

  it("renders skill chips and allows selecting/deselecting a skill", () => {
    render(<AboutMeContent />);

    // Check core skills buttons
    const reactChip = screen.getByRole("button", { name: /Skill React/i });
    const dockerChip = screen.getByRole("button", { name: /Skill Docker/i });
    const tsChip = screen.getByRole("button", { name: /Skill TypeScript/i });

    expect(reactChip).toBeInTheDocument();
    expect(dockerChip).toBeInTheDocument();
    expect(tsChip).toBeInTheDocument();

    // Initially not pressed
    expect(reactChip).toHaveAttribute("aria-pressed", "false");

    // Click to select
    fireEvent.click(reactChip);
    expect(reactChip).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Proficiency: 85%/i)).toBeInTheDocument();

    // Click again to deselect
    fireEvent.click(reactChip);
    expect(reactChip).toHaveAttribute("aria-pressed", "false");
  });
});
