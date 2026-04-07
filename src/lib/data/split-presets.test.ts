import { describe, expect, it } from "vitest";

import { exerciseLibraryBySlug } from "./exercise-library";
import { getDefaultSplitPreset, splitPresets } from "./split-presets";

describe("split presets", () => {
  it("exposes a default preset for first-time users", () => {
    const defaultPreset = getDefaultSplitPreset();

    expect(defaultPreset.name).toBe("Upper / Lower");
    expect(defaultPreset.sessionsPerWeek).toBe(4);
  });

  it("keeps the seeded split catalog populated", () => {
    expect(splitPresets.length).toBeGreaterThan(0);
    expect(exerciseLibraryBySlug.get("pull-up")?.name).toBe("Pull-Up");
  });
});