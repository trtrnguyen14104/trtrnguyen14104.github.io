import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Taskbar } from "@/components/windows/Taskbar";
import { StartMenu } from "@/components/windows/StartMenu";
import { WindowConfig, WindowId } from "@/hooks/useWindowManager";

const mockWindows: Record<WindowId, WindowConfig> = {
  "about-me": {
    id: "about-me",
    title: "About Me",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 0, y: 0 },
    size: { width: 500, height: 400 },
  },
  projects: {
    id: "projects",
    title: "Projects",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 0, y: 0 },
    size: { width: 500, height: 400 },
  },
  contact: {
    id: "contact",
    title: "Contact",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: true,
    isMinimized: true,
    isMaximized: false,
    zIndex: 11,
    position: { x: 0, y: 0 },
    size: { width: 500, height: 400 },
  },
};

describe("Taskbar Component", () => {
  const mockOpenWindow = vi.fn();
  const mockMinimizeWindow = vi.fn();
  const mockBringToFront = vi.fn();
  const mockRestartPortfolio = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders start button, search pill, pinned icons, and system tray icons", () => {
    render(
      <Taskbar
        windows={mockWindows}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
        onRestartPortfolio={mockRestartPortfolio}
      />,
    );

    // Start button
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();

    // Search bar with placeholder
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

    // Pinned folder icon and globe icon
    expect(screen.getByAltText(/pinned folder/i)).toBeInTheDocument();
    expect(screen.getByTitle(/browser/i)).toBeInTheDocument();

    // System tray icons
    expect(screen.getByTitle(/wifi/i)).toBeInTheDocument();
    expect(screen.getByTitle(/volume/i)).toBeInTheDocument();
    expect(screen.getByAltText(/battery/i)).toBeInTheDocument();
  });

  it("renders open window badges and handles active vs minimized clicks", () => {
    render(
      <Taskbar
        windows={mockWindows}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
      />,
    );

    // "about-me" is open and active
    const aboutBtn = screen.getByRole("button", { name: /about me/i });
    expect(aboutBtn).toBeInTheDocument();

    // "contact" is open and minimized
    const contactBtn = screen.getByRole("button", { name: /contact/i });
    expect(contactBtn).toBeInTheDocument();

    // "projects" is closed -> should not appear in taskbar badges
    expect(screen.queryByRole("button", { name: /^projects$/i })).not.toBeInTheDocument();

    // Clicking active window badge minimizes it
    fireEvent.click(aboutBtn);
    expect(mockMinimizeWindow).toHaveBeenCalledWith("about-me");

    // Clicking minimized window badge restores/brings it to front
    fireEvent.click(contactBtn);
    expect(mockBringToFront).toHaveBeenCalledWith("contact");
  });

  it("renders nostalgic date 14/10/2004 and toggles to live date", () => {
    render(
      <Taskbar
        windows={mockWindows}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
      />,
    );

    // Default displays 4:04 PM and 14/10/2004
    expect(screen.getByText("4:04 PM")).toBeInTheDocument();
    expect(screen.getByText("14/10/2004")).toBeInTheDocument();

    // Click clock/date to toggle live date mode
    const clockArea = screen.getByRole("button", { name: /clock and date/i });
    fireEvent.click(clockArea);

    // In live date mode, it formats the current time and date
    // Neither 14/10/2004 nor 4:04 PM should be strictly rendered unless current time happens to match
    // Toggle back to nostalgic date
    fireEvent.click(clockArea);
    expect(screen.getByText("4:04 PM")).toBeInTheDocument();
    expect(screen.getByText("14/10/2004")).toBeInTheDocument();
  });

  it("toggles Start Menu popup and handles folder shortcuts and restart", () => {
    render(
      <Taskbar
        windows={mockWindows}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
        onRestartPortfolio={mockRestartPortfolio}
      />,
    );

    // Initially StartMenu is not visible
    expect(screen.queryByText("Trần Trung Nguyên")).not.toBeInTheDocument();

    // Click Start button to open
    const startBtn = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startBtn);

    // StartMenu content visible
    expect(screen.getByText("Trần Trung Nguyên")).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();

    // Click Projects folder shortcut
    const projectsShortcut = screen.getByRole("button", { name: /open projects/i });
    fireEvent.click(projectsShortcut);
    expect(mockOpenWindow).toHaveBeenCalledWith("projects");

    // Start menu should close after opening a folder
    expect(screen.queryByText("Trần Trung Nguyên")).not.toBeInTheDocument();

    // Open Start menu again and click Restart
    fireEvent.click(startBtn);
    const restartBtn = screen.getByRole("button", { name: /restart portfolio/i });
    fireEvent.click(restartBtn);
    expect(mockRestartPortfolio).toHaveBeenCalled();
  });

  it("closes Start Menu when pressing Escape", () => {
    render(
      <Taskbar
        windows={mockWindows}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
      />,
    );

    const startBtn = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startBtn);
    expect(screen.getByText("Trần Trung Nguyên")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Trần Trung Nguyên")).not.toBeInTheDocument();
  });
});

describe("StartMenu Component (Isolated)", () => {
  it("renders profile details, quick shortcuts, and triggers callbacks", () => {
    const handleOpen = vi.fn();
    const handleClose = vi.fn();
    const handleRestart = vi.fn();

    render(
      <StartMenu
        isOpen={true}
        onClose={handleClose}
        onOpenWindow={handleOpen}
        onRestartPortfolio={handleRestart}
      />,
    );

    expect(screen.getByText("Trần Trung Nguyên")).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
    expect(screen.getByAltText(/profile avatar/i)).toBeInTheDocument();

    // Click contact folder shortcut
    const contactBtn = screen.getByRole("button", { name: /open contact/i });
    fireEvent.click(contactBtn);
    expect(handleOpen).toHaveBeenCalledWith("contact");
    expect(handleClose).toHaveBeenCalled();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <StartMenu
        isOpen={false}
        onClose={vi.fn()}
        onOpenWindow={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
