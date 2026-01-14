import { describe, it, expect, vi } from "vitest";
import AppInitializer from "../../../src/models/initializer/AppInitializer";

const createInitializer = (overrides?: Partial<Record<string, () => Promise<boolean>>>) => {
  return {
    checkDatabaseConnection: vi.fn().mockResolvedValue(true),
    checkDatabasesStructure: vi.fn().mockResolvedValue(true),
    checkDatabasesInitialData: vi.fn().mockResolvedValue(true),
    updateAuthServerConfiguration: vi.fn().mockResolvedValue(true),
    updateWorldServerConfiguration: vi.fn().mockResolvedValue(true),
    updateApplicationDatabase: vi.fn().mockResolvedValue(true),
    updateRealmInformations: vi.fn().mockResolvedValue(true),
    checkClientMapData: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
};

describe("AppInitializer", () => {
  it("returns false on the first failing step", async () => {
    const initializer = createInitializer({
      checkDatabasesStructure: vi.fn().mockResolvedValue(false),
    });
    const appInitializer = new AppInitializer(initializer);

    const result = await appInitializer.initialize();

    expect(result).toBe(false);
    expect(initializer.checkDatabaseConnection).toHaveBeenCalled();
    expect(initializer.checkDatabasesStructure).toHaveBeenCalled();
    expect(initializer.checkDatabasesInitialData).not.toHaveBeenCalled();
  });

  it.each([
    ["checkDatabaseConnection"],
    ["checkDatabasesStructure"],
    ["checkDatabasesInitialData"],
    ["updateAuthServerConfiguration"],
    ["updateWorldServerConfiguration"],
    ["updateApplicationDatabase"],
    ["updateRealmInformations"],
    ["checkClientMapData"],
  ])("returns false when %s fails", async (method) => {
    const overrides: Partial<Record<string, () => Promise<boolean>>> = {
      [method]: vi.fn().mockResolvedValue(false),
    };
    const initializer = createInitializer(overrides);
    const appInitializer = new AppInitializer(initializer);

    const result = await appInitializer.initialize();

    expect(result).toBe(false);
  });

  it("returns true when all steps succeed", async () => {
    const initializer = createInitializer();
    const appInitializer = new AppInitializer(initializer);

    const result = await appInitializer.initialize();

    expect(result).toBe(true);
    expect(initializer.checkClientMapData).toHaveBeenCalled();
  });
});
