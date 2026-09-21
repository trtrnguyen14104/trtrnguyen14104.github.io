import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProjectsContent } from "@/components/windows/ProjectsContent";
import { LaptopMockup } from "@/components/windows/LaptopMockup";
import { portfolioData } from "@/data/portfolioData";
import gsap from "gsap";

describe("ProjectsContent Component", () => {
  beforeEach(() => {
    gsap.killTweensOf("*");
  });

  afterEach(() => {
    gsap.killTweensOf("*");
    document.body.innerHTML = "";
  });

  it("renders initial project (Quiz App) and its metadata", () => {
    render(<ProjectsContent />);

    // Initial project is Project 1: Quiz App
    expect(screen.getByRole("heading", { name: /^Quiz App$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Solo Project \| Fullstack Developer/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A full-stack Quiz App featuring topic selection/i)
    ).toBeInTheDocument();

    // Tech stack tags
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Express")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("TailwindCSS")).toBeInTheDocument();

    // GitHub link
    const githubLink = screen.getByRole("link", {
      name: /view source code|github/i,
    });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/trtrnguyen14104/Quiz_app"
    );
  });

  it("switches projects using Next and Previous buttons", () => {
    render(<ProjectsContent />);

    expect(screen.getByRole("heading", { name: /^Quiz App$/i })).toBeInTheDocument();

    const nextBtn = screen.getByLabelText(/next project/i);
    fireEvent.click(nextBtn);

    // Now Project 2: AloChat
    expect(
      screen.getByRole("heading", { name: /Social Media AloChat/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();

    // Click Next again to Project 3
    fireEvent.click(nextBtn);
    expect(
      screen.getByRole("heading", { name: /Research Data Management System/i })
    ).toBeInTheDocument();

    // Click Previous to return to Project 2
    const prevBtn = screen.getByLabelText(/previous project/i);
    fireEvent.click(prevBtn);
    expect(
      screen.getByRole("heading", { name: /Social Media AloChat/i })
    ).toBeInTheDocument();
  });

  it("switches projects by clicking folder tabs", () => {
    render(<ProjectsContent />);

    // Click on 02_AloChat folder tab
    const aloChatTab = screen.getByRole("button", {
      name: /02_AloChat/i,
    });
    fireEvent.click(aloChatTab);

    expect(
      screen.getByRole("heading", { name: /Social Media AloChat/i })
    ).toBeInTheDocument();

    // Click on 03_Research_System folder tab
    const researchTab = screen.getByRole("button", {
      name: /03_Research_System/i,
    });
    fireEvent.click(researchTab);

    expect(
      screen.getByRole("heading", { name: /Research Data Management System/i })
    ).toBeInTheDocument();
  });

  it("supports keyboard navigation with ArrowRight and ArrowLeft", () => {
    render(<ProjectsContent />);

    expect(screen.getByRole("heading", { name: /^Quiz App$/i })).toBeInTheDocument();

    // Press ArrowRight on window
    fireEvent.keyDown(window, {
      key: "ArrowRight",
      code: "ArrowRight",
    });

    expect(
      screen.getByRole("heading", { name: /Social Media AloChat/i })
    ).toBeInTheDocument();

    // Press ArrowLeft on window
    fireEvent.keyDown(window, {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });

    expect(screen.getByRole("heading", { name: /^Quiz App$/i })).toBeInTheDocument();
  });

  it("toggles between Showcase mode and File Explorer Grid mode", () => {
    render(<ProjectsContent />);

    // Initially in showcase mode: Laptop mockup exists
    expect(screen.getByTestId("laptop-mockup")).toBeInTheDocument();

    // Toggle to Grid / Explorer mode
    const gridToggle = screen.getByRole("button", {
      name: /grid view|file explorer|explorer view/i,
    });
    fireEvent.click(gridToggle);

    // Explorer grid should now be visible
    const gridView = screen.getByTestId("explorer-grid-view");
    expect(gridView).toBeInTheDocument();
    expect(within(gridView).getByText("01_Quiz_App")).toBeInTheDocument();
    expect(within(gridView).getByText("02_AloChat")).toBeInTheDocument();
    expect(within(gridView).getByText("03_Research_System")).toBeInTheDocument();
    expect(within(gridView).getByText("README.md")).toBeInTheDocument();

    // Toggle back to Showcase mode
    const showcaseToggle = screen.getByRole("button", {
      name: /^showcase view$/i,
    });
    fireEvent.click(showcaseToggle);

    expect(screen.getByTestId("laptop-mockup")).toBeInTheDocument();
  });

  describe("LaptopMockup Component", () => {
    it("renders realistic chassis, 3 fan-out cards, and cursive script text", () => {
      const project = portfolioData.projects[0];
      render(<LaptopMockup project={project} />);

      // Verify laptop mockup container and chassis
      expect(screen.getByTestId("laptop-mockup")).toBeInTheDocument();
      expect(screen.getByTestId("laptop-base")).toBeInTheDocument();
      expect(screen.getByTestId("laptop-screen")).toBeInTheDocument();

      // 3 fan-out cards: left, center/main, right
      expect(screen.getByTestId("fan-card-left")).toBeInTheDocument();
      expect(screen.getByTestId("fan-card-main")).toBeInTheDocument();
      expect(screen.getByTestId("fan-card-right")).toBeInTheDocument();

      // Script text overlay
      expect(screen.getByText(/project 1/i)).toBeInTheDocument();
    });

    it("displays clean fallback card when an image fails to load", () => {
      const project = portfolioData.projects[0];
      render(<LaptopMockup project={project} />);

      const leftImg = screen.getByAltText(/Quiz App - Left Preview/i);
      expect(leftImg).toBeInTheDocument();

      // Trigger image load error
      fireEvent.error(leftImg);

      // Fallback card should render
      expect(screen.getByTestId("fallback-card-left")).toBeInTheDocument();
    });
  });
});
