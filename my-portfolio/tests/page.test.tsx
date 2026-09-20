import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Page from "@/app/page";
import gsap from "gsap";

describe("Portfolio Home Page Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gsap.killTweensOf("*");
  });

  afterEach(() => {
    gsap.killTweensOf("*");
    document.body.innerHTML = "";
  });

  it("renders desktop, wallpaper, folder icons, and taskbar", () => {
    render(<Page />);

    // Hero typography
    expect(screen.getByText(/TRẦN TRUNG NGUYÊN/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();

    // Wallpaper
    const wallpaper = screen.getByAltText(/desktop wallpaper/i);
    expect(wallpaper).toBeInTheDocument();

    // Desktop folder icons
    expect(screen.getByRole("button", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();

    // Taskbar navigation
    expect(screen.getByRole("navigation", { name: "Windows Taskbar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pinned Folder" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clock and date" })).toBeInTheDocument();
  });

  it("opens About Me window on folder double-click and allows closing it", async () => {
    render(<Page />);

    // Initially, About Me dialog should not be open
    expect(screen.queryByRole("dialog", { name: /About Me/i })).not.toBeInTheDocument();

    // Double click About Me folder icon
    const aboutMeFolder = screen.getByRole("button", { name: "About Me" });
    fireEvent.doubleClick(aboutMeFolder);

    // About Me window opens
    const dialog = await screen.findByRole("dialog", { name: /About Me/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/hi, its Nguyen!/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Trần Trung Nguyên/i)).toBeInTheDocument();

    // Close the window
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /About Me/i })).not.toBeInTheDocument();
    });
  });

  it("opens Projects window on folder double-click and keyboard Enter", async () => {
    render(<Page />);

    // Double-click Projects folder
    const projectsFolder = screen.getByRole("button", { name: "Projects" });
    fireEvent.doubleClick(projectsFolder);

    const dialog = await screen.findByRole("dialog", { name: /Projects/i });
    expect(dialog).toBeInTheDocument();

    // Close it
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Projects/i })).not.toBeInTheDocument();
    });

    // Open via keyboard navigation (Enter key)
    fireEvent.keyDown(projectsFolder, { key: "Enter", code: "Enter" });
    const reopenedDialog = await screen.findByRole("dialog", { name: /Projects/i });
    expect(reopenedDialog).toBeInTheDocument();
  });

  it("opens Contact window on folder double-click", async () => {
    render(<Page />);

    const contactFolder = screen.getByRole("button", { name: "Contact" });
    fireEvent.doubleClick(contactFolder);

    const dialog = await screen.findByRole("dialog", { name: /Contact/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Send a Message/i)).toBeInTheDocument();
  });

  it("supports window minimize and restore via taskbar button", async () => {
    render(<Page />);

    // Open About Me window
    const aboutMeFolder = screen.getByRole("button", { name: "About Me" });
    fireEvent.doubleClick(aboutMeFolder);

    const dialog = await screen.findByRole("dialog", { name: /About Me/i });
    expect(dialog).toBeInTheDocument();

    // Minimize window using header minimize button
    const minimizeBtn = screen.getByRole("button", { name: "Minimize" });
    fireEvent.click(minimizeBtn);

    // After minimize, dialog should be hidden
    await waitFor(() => {
      expect(dialog).toHaveAttribute("aria-hidden", "true");
    });

    // Taskbar should display the open window badge "About Me"
    const taskbar = screen.getByRole("navigation", { name: "Windows Taskbar" });
    const taskbarBadge = within(taskbar).getByRole("button", { name: "About Me" });
    expect(taskbarBadge).toBeInTheDocument();

    // Clicking taskbar badge restores the window
    fireEvent.click(taskbarBadge);

    await waitFor(() => {
      expect(dialog).toHaveAttribute("aria-hidden", "false");
    });
  });

  it("opens window when clicking pinned folder in taskbar", async () => {
    render(<Page />);

    const pinnedFolderBtn = screen.getByRole("button", { name: "Pinned Folder" });
    fireEvent.click(pinnedFolderBtn);

    const dialog = await screen.findByRole("dialog", { name: /Projects/i });
    expect(dialog).toBeInTheDocument();
  });

  it("opens window via Start Menu items", async () => {
    render(<Page />);

    // Click Start button to open Start Menu
    const startBtn = screen.getByRole("button", { name: "Start" });
    fireEvent.click(startBtn);

    // Start menu should be visible with "Contact" item
    const contactMenuItem = screen.getByRole("button", { name: /Open Contact/i });
    fireEvent.click(contactMenuItem);

    const dialog = await screen.findByRole("dialog", { name: /Contact/i });
    expect(dialog).toBeInTheDocument();
  });
});
