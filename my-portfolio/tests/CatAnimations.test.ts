import { describe, expect, it } from "vitest";
import sleepingCat from "../public/animations/Cat_sleeping_animation.json";
import butterflyCat from "../public/animations/Cat_butterfly_animation.json";

function checkKeyframes(value: unknown) {
  if (!value || typeof value !== "object") return;

  const property = value as { a?: number; k?: unknown[] };
  if (property.a === 1 && Array.isArray(property.k)) {
    // A single animated keyframe leaves Lottie's position at its offscreen sentinel.
    expect(property.k.length).toBeGreaterThanOrEqual(2);
  }

  Object.values(value).forEach(checkKeyframes);
}

describe("Extracted cat animations", () => {
  it.each([
    ["sleeping", sleepingCat],
    ["butterfly", butterflyCat],
  ])("has renderable keyframes in the %s animation", (_name, animation) => {
    checkKeyframes(animation);
  });
});
