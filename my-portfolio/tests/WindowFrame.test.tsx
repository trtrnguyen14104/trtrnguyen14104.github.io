import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WindowFrame } from "@/components/windows/WindowFrame";

describe("WindowFrame Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title bar and buttons, firing appropriate events", () => {
    const handleClose = vi.fn();
    const handleMinimize = vi.fn();
    const handleMaximize = vi.fn();

    render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        zIndex={20}
        position={{ x: 50, y: 50 }}
        size={{ width: 600, height: 400 }}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onFocus={vi.fn()}
      >
        <div>Explorer Content</div>
      </WindowFrame>
    );

    expect(screen.getByText(/About Me - File Explorer/i)).toBeInTheDocument();
    expect(screen.getByText("Explorer Content")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("fires onMinimize when minimize button is clicked", () => {
    const handleMinimize = vi.fn();

    render(
      <WindowFrame
        id="projects"
        title="Projects - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
        onMinimize={handleMinimize}
        onMaximize={vi.fn()}
      >
        <div>Projects Content</div>
      </WindowFrame>
    );

    const minimizeBtn = screen.getByLabelText(/minimize/i);
    fireEvent.click(minimizeBtn);
    expect(handleMinimize).toHaveBeenCalled();
  });

  it("fires onMaximize when maximize button is clicked and displays Restore label when maximized", () => {
    const handleMaximize = vi.fn();

    const { rerender } = render(
      <WindowFrame
        id="contact"
        title="Contact - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onMaximize={handleMaximize}
      >
        <div>Contact Content</div>
      </WindowFrame>
    );

    const maxBtn = screen.getByLabelText(/maximize/i);
    fireEvent.click(maxBtn);
    expect(handleMaximize).toHaveBeenCalledTimes(1);

    // Re-render as maximized
    rerender(
      <WindowFrame
        id="contact"
        title="Contact - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={true}
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onMaximize={handleMaximize}
      >
        <div>Contact Content</div>
      </WindowFrame>
    );

    const restoreBtn = screen.getByLabelText(/restore/i);
    expect(restoreBtn).toBeInTheDocument();
    fireEvent.click(restoreBtn);
    expect(handleMaximize).toHaveBeenCalledTimes(2);
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={false}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
      >
        <div>Should Not Render</div>
      </WindowFrame>
    );

    expect(container.firstChild).toBeNull();
  });

  it("hides window with display none when isMinimized is true", () => {
    const { container } = render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={true}
        isMaximized={false}
        onClose={vi.fn()}
      >
        <div>Minimized Content</div>
      </WindowFrame>
    );

    const windowEl = container.querySelector('[data-window-id="about-me"]');
    expect(windowEl).toBeInTheDocument();
    expect(windowEl).toHaveStyle({ display: "none" });
  });

  it("renders explorer toolbar with navigation buttons, breadcrumb address bar, and search box", () => {
    const handleBack = vi.fn();
    const handleForward = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
      >
        <div>Body Content</div>
      </WindowFrame>
    );

    // Navigation buttons
    const backBtn = screen.getByLabelText(/back/i);
    const forwardBtn = screen.getByLabelText(/forward/i);
    const refreshBtn = screen.getByLabelText(/refresh/i);

    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalled();

    fireEvent.click(forwardBtn);
    expect(handleForward).toHaveBeenCalled();

    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalled();

    // Breadcrumb address bar
    expect(screen.getByText(/this pc/i)).toBeInTheDocument();
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText("About Me")).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/search about me/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: "developer" } });
    expect(searchInput).toHaveValue("developer");
  });

  it("handles header dragging and stays within viewport bounds", () => {
    const handlePositionChange = vi.fn();
    const handleFocus = vi.fn();

    const { container } = render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        position={{ x: 100, y: 100 }}
        size={{ width: 500, height: 400 }}
        onClose={vi.fn()}
        onFocus={handleFocus}
        onPositionChange={handlePositionChange}
      >
        <div>Draggable Content</div>
      </WindowFrame>
    );

    const header = container.querySelector(".window-header");
    expect(header).toBeInTheDocument();

    if (header) {
      // Start drag
      fireEvent.pointerDown(header, { clientX: 150, clientY: 120 });
      expect(handleFocus).toHaveBeenCalled();

      // Drag to new coordinates
      fireEvent.pointerMove(header, { clientX: 200, clientY: 170 });
      expect(handlePositionChange).toHaveBeenCalledWith({ x: 150, y: 150 });

      // End drag
      fireEvent.pointerUp(header, { clientX: 200, clientY: 170 });
    }
  });

  it("toggles maximize on header double-click", () => {
    const handleMaximize = vi.fn();

    const { container } = render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
        onMaximize={handleMaximize}
      >
        <div>Content</div>
      </WindowFrame>
    );

    const header = container.querySelector(".window-header");
    expect(header).toBeInTheDocument();
    if (header) {
      fireEvent.doubleClick(header);
      expect(handleMaximize).toHaveBeenCalledTimes(1);
    }
  });

  it("triggers onFocus when clicking inside the window body", () => {
    const handleFocus = vi.fn();

    render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        onClose={vi.fn()}
        onFocus={handleFocus}
      >
        <div>Clickable Content</div>
      </WindowFrame>
    );

    fireEvent.pointerDown(screen.getByText("Clickable Content"));
    expect(handleFocus).toHaveBeenCalled();
  });

  it("applies full viewport layout leaving taskbar visible when isMaximized is true", () => {
    const { container } = render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={true}
        zIndex={30}
        onClose={vi.fn()}
      >
        <div>Maximized Content</div>
      </WindowFrame>
    );

    const windowEl = container.querySelector('[data-window-id="about-me"]');
    expect(windowEl).toBeInTheDocument();
    expect(windowEl).toHaveStyle({
      position: "fixed",
      top: "0px",
      left: "0px",
      zIndex: 30,
    });
    // Taskbar height is 48px, so maximized height leaves bottom 48px visible
    expect(windowEl).toHaveStyle({
      height: "calc(100vh - 48px)",
    });
  });

  it("renders status bar at the bottom with item count", () => {
    render(
      <WindowFrame
        id="projects"
        title="Projects - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        statusText="3 items | 1 selected"
        onClose={vi.fn()}
      >
        <div>Projects list</div>
      </WindowFrame>
    );

    expect(screen.getByText("3 items | 1 selected")).toBeInTheDocument();
  });
});
