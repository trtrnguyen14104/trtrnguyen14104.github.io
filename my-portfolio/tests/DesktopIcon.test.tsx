import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesktopIcon } from "@/components/windows/DesktopIcon";
import { HeroTypography } from "@/components/windows/HeroTypography";
import { Desktop, DEFAULT_DESKTOP_FOLDERS } from "@/components/windows/Desktop";
import * as animations from "@/utils/gsapAnimations";

describe("DesktopIcon Component", () => {
  it("handles click to select and double click to open", () => {
    const handleSelect = vi.fn();
    const handleOpen = vi.fn();

    render(
      <DesktopIcon
        id="about-me"
        label="About Me"
        icon="/icons/Windows-FOLDER.png"
        isSelected={false}
        onSelect={handleSelect}
        onOpen={handleOpen}
      />
    );

    const label = screen.getByText("About Me");
    const iconBtn = screen.getByRole("button", { name: /about me/i });

    // Single click triggers selection
    fireEvent.click(iconBtn);
    expect(handleSelect).toHaveBeenCalledWith("about-me");

    // Double click triggers open
    fireEvent.doubleClick(label);
    expect(handleOpen).toHaveBeenCalledWith("about-me", expect.anything());
  });

  it("applies blue highlight box when selected", () => {
    const { rerender } = render(
      <DesktopIcon
        id="projects"
        label="Projects"
        icon="/icons/Windows-FOLDER.png"
        isSelected={false}
        onSelect={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /projects/i });
    expect(button).not.toHaveClass("bg-blue-500/25");
    expect(button).toHaveAttribute("aria-selected", "false");

    rerender(
      <DesktopIcon
        id="projects"
        label="Projects"
        icon="/icons/Windows-FOLDER.png"
        isSelected={true}
        onSelect={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(button).toHaveClass("bg-blue-500/25");
    expect(button).toHaveAttribute("aria-selected", "true");
  });

  it("supports keyboard navigation with Enter key to open", () => {
    const handleOpen = vi.fn();

    render(
      <DesktopIcon
        id="contact"
        label="Contact"
        icon="/icons/Windows-FOLDER.png"
        isSelected={true}
        onSelect={vi.fn()}
        onOpen={handleOpen}
      />
    );

    const button = screen.getByRole("button", { name: /contact/i });
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    expect(handleOpen).toHaveBeenCalledWith("contact", expect.anything());
  });

  it("supports touch tap to open when item is already selected or double tapped", () => {
    const handleOpen = vi.fn();
    const handleSelect = vi.fn();

    render(
      <DesktopIcon
        id="about-me"
        label="About Me"
        icon="/icons/Windows-FOLDER.png"
        isSelected={true}
        onSelect={handleSelect}
        onOpen={handleOpen}
      />
    );

    const button = screen.getByRole("button", { name: /about me/i });
    fireEvent.touchEnd(button);
    expect(handleOpen).toHaveBeenCalledWith("about-me", expect.anything());
  });
});

describe("HeroTypography Component", () => {
  it("renders arched owner name and groovy retro script Portfolio with hero-typography class", () => {
    const { container } = render(<HeroTypography />);

    const heroEl = container.querySelector(".hero-typography");
    expect(heroEl).toBeInTheDocument();

    expect(screen.getByText(/TRẦN TRUNG NGUYÊN/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();
  });
});

describe("Desktop Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders wallpaper, default folder icons, and hero typography", () => {
    render(<Desktop />);

    // Wallpaper
    const wallpaper = screen.getByAltText(/desktop wallpaper/i);
    expect(wallpaper).toBeInTheDocument();
    expect(wallpaper.getAttribute("src")).toContain("backgorund-home.png");

    // Hero typography
    expect(screen.getByText(/TRẦN TRUNG NGUYÊN/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();

    // Default 3 folder icons arranged vertically
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(DEFAULT_DESKTOP_FOLDERS).toHaveLength(3);
  });

  it("triggers animateDesktopIntro on mount", () => {
    const introSpy = vi.spyOn(animations, "animateDesktopIntro");

    render(<Desktop />);

    expect(introSpy).toHaveBeenCalled();
  });

  it("allows selecting and opening folders on the desktop", () => {
    const handleOpenFolder = vi.fn();
    render(<Desktop onOpenFolder={handleOpenFolder} />);

    const aboutMeBtn = screen.getByRole("button", { name: /about me/i });
    fireEvent.click(aboutMeBtn);
    expect(aboutMeBtn).toHaveAttribute("aria-selected", "true");

    fireEvent.doubleClick(aboutMeBtn);
    expect(handleOpenFolder).toHaveBeenCalledWith("about-me", expect.anything());
  });

  it("deselects icons when clicking on empty desktop wallpaper background", () => {
    const handleSelectFolder = vi.fn();
    const { container } = render(
      <Desktop selectedFolderId="about-me" onSelectFolder={handleSelectFolder} />
    );

    const desktopBg = container.querySelector(".desktop-background");
    expect(desktopBg).toBeInTheDocument();

    if (desktopBg) {
      fireEvent.click(desktopBg);
      expect(handleSelectFolder).toHaveBeenCalledWith(null);
    }
  });

  it("renders active windows layer / children", () => {
    render(
      <Desktop>
        <div data-testid="test-window">Active Window Content</div>
      </Desktop>
    );

    expect(screen.getByTestId("test-window")).toBeInTheDocument();
    expect(screen.getByText("Active Window Content")).toBeInTheDocument();
  });
});
