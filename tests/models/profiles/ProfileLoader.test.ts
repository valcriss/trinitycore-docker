import { describe, it, expect, vi, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("ProfileLoader", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("loads profile 3.3.5", async () => {
    process.env.TRINITYCORE_VERSION = "3.3.5";
    const ProfileLoader = (await import("../../../src/models/profiles/ProfileLoader")).default;
    const profile = ProfileLoader.loadProfile();
    expect(profile.getName()).toContain("3.3.5");
  });

  it("loads profile 4.4.2", async () => {
    process.env.TRINITYCORE_VERSION = "4.4.2";
    const ProfileLoader = (await import("../../../src/models/profiles/ProfileLoader")).default;
    const profile = ProfileLoader.loadProfile();
    expect(profile.getName()).toContain("4.4.2");
  });

  it("loads profile 11.1.0", async () => {
    process.env.TRINITYCORE_VERSION = "11.1.0";
    const ProfileLoader = (await import("../../../src/models/profiles/ProfileLoader")).default;
    const profile = ProfileLoader.loadProfile();
    expect(profile.getName()).toContain("11.1.0");
  });

  it("throws for unsupported versions", async () => {
    process.env.TRINITYCORE_VERSION = "9.9.9";
    const ProfileLoader = (await import("../../../src/models/profiles/ProfileLoader")).default;
    expect(() => ProfileLoader.loadProfile()).toThrow("Unsupported version");
  });

  it("throws when no version is provided", async () => {
    delete process.env.TRINITYCORE_VERSION;
    const ProfileLoader = (await import("../../../src/models/profiles/ProfileLoader")).default;
    expect(() => ProfileLoader.loadProfile()).toThrow("Unsupported version");
  });
});
