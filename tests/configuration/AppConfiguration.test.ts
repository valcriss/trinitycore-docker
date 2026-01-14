import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadConfig = async (env: Record<string, string | undefined>) => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, ...env };
  const config = (await import("../../src/models/configuration/AppConfiguration")).default;
  return config;
};

describe("AppConfiguration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("uses environment overrides", async () => {
    const config = await loadConfig({
      ACCESS_USERNAME: "user",
      ACCESS_PASSWORD: "pass",
      REALM_NAME: "Realm",
      PUBLIC_IP_ADDRESS: "1.2.3.4",
    });

    expect(config.getAccessUsername()).toBe("user");
    expect(config.getAccessPassword()).toBe("pass");
    expect(config.getRealmName()).toBe("Realm");
    expect(config.getPublicIpAddress()).toBe("1.2.3.4");
  });

  it("uses defaults when env is missing", async () => {
    const config = await loadConfig({
      ACCESS_USERNAME: undefined,
      ACCESS_PASSWORD: undefined,
      REALM_NAME: undefined,
      PUBLIC_IP_ADDRESS: undefined,
    });

    expect(config.getAccessUsername()).toBeNull();
    expect(config.getAccessPassword()).toBeNull();
    expect(config.getRealmName()).toBe("TrinityCore");
    expect(config.getPublicIpAddress()).toBe("127.0.0.1");

    const dbConfig = config.getDatabaseConfiguration();
    expect(dbConfig.root.user).toBe("root");
    expect(dbConfig.auth.database).toBe("auth");
    expect(dbConfig.world.database).toBe("world");
  });
});
