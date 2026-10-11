import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { LottiePlayer } from "@/components/common/LottiePlayer";

const mockDestroy = vi.fn();
const mockSetSpeed = vi.fn();

vi.mock("lottie-web", () => {
  return {
    default: {
      loadAnimation: vi.fn().mockImplementation(() => ({
        destroy: mockDestroy,
        setSpeed: mockSetSpeed,
      })),
    },
  };
});

describe("LottiePlayer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders container element with proper aria-label and testId", () => {
    render(
      <LottiePlayer
        ariaLabel="Cute cat playing"
        testId="cat-player"
        className="w-32 h-32"
      />
    );

    const el = screen.getByTestId("cat-player");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "Cute cat playing");
    expect(el).toHaveClass("w-32", "h-32", "pointer-events-none");
  });

  it("loads animation when animationData is provided", async () => {
    const fakeData = { v: "5.9.4", fr: 30, ip: 0, op: 100, layers: [] };
    render(
      <LottiePlayer
        animationData={fakeData}
        testId="cat-player"
        speed={1.5}
      />
    );

    await waitFor(() => {
      expect(mockSetSpeed).toHaveBeenCalledWith(1.5);
    });
  });

  it("destroys animation instance on unmount", async () => {
    const fakeData = { v: "5.9.4", fr: 30, ip: 0, op: 100, layers: [] };
    const { unmount } = render(
      <LottiePlayer animationData={fakeData} testId="cat-player" />
    );

    await waitFor(() => {
      const el = screen.getByTestId("cat-player");
      expect(el).toBeInTheDocument();
    });

    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});

