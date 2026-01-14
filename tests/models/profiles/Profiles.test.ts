import { describe, it, expect } from "vitest";
import Profile1110 from "../../../src/models/profiles/Profile1110";
import Profile335 from "../../../src/models/profiles/Profile335";
import Profile442 from "../../../src/models/profiles/Profile442";
import InitializerRegular from "../../../src/models/initializer/InitializerRegular";

describe("Profiles", () => {
  it("returns expected values for 3.3.5 profile", () => {
    const profile = new Profile335();
    expect(profile.getName()).toContain("3.3.5");
    expect(profile.getAuthServerBinary()).toBe("/app/server/bin/authserver");
    expect(profile.getWorldServerBinary()).toBe("/app/server/bin/worldserver");
    expect(profile.getAuthServerConfigurationPath()).toBe("/app/server/etc/authserver.conf");
    expect(profile.getWorldServerConfigurationPath()).toBe("/app/server/etc/worldserver.conf");
    expect(profile.getInitializeDatabasePath()).toBe("create-mysql-335.sql");
    expect(profile.getInitialDatabaseNamePattern()).toBe("TDB_full_world_335");
    expect(profile.getExtractScriptPath()).toBe("extract-335.sh");
    expect(profile.getSourceAuthConfigurationPath()).toBe("authserver.335.conf.dist");
    expect(profile.getSourceWorldConfigurationPath()).toBe("worldserver.335.conf.dist");
    expect(profile.getInitializer()).toBeInstanceOf(InitializerRegular);
  });

  it("returns expected values for 4.4.2 profile", () => {
    const profile = new Profile442();
    expect(profile.getName()).toContain("4.4.2");
    expect(profile.getAuthServerBinary()).toBe("/app/server/bin/bnetserver");
    expect(profile.getWorldServerBinary()).toBe("/app/server/bin/worldserver");
    expect(profile.getAuthServerConfigurationPath()).toBe("/app/server/etc/bnetserver.conf");
    expect(profile.getWorldServerConfigurationPath()).toBe("/app/server/etc/worldserver.conf");
    expect(profile.getInitializeDatabasePath()).toBe("create-mysql-442.sql");
    expect(profile.getInitialDatabaseNamePattern()).toBe("TDB_full_4");
    expect(profile.getExtractScriptPath()).toBe("extract-442.sh");
    expect(profile.getSourceAuthConfigurationPath()).toBe("bnetserver.442.conf.dist");
    expect(profile.getSourceWorldConfigurationPath()).toBe("worldserver.442.conf.dist");
    expect(profile.getInitializer()).toBeInstanceOf(InitializerRegular);
  });

  it("returns expected values for 11.1.0 profile", () => {
    const profile = new Profile1110();
    expect(profile.getName()).toContain("11.1.0");
    expect(profile.getAuthServerBinary()).toBe("/app/server/bin/bnetserver");
    expect(profile.getWorldServerBinary()).toBe("/app/server/bin/worldserver");
    expect(profile.getAuthServerConfigurationPath()).toBe("/app/server/etc/bnetserver.conf");
    expect(profile.getWorldServerConfigurationPath()).toBe("/app/server/etc/worldserver.conf");
    expect(profile.getInitializeDatabasePath()).toBe("create-mysql-1110.sql");
    expect(profile.getInitialDatabaseNamePattern()).toBe("TDB_full_1");
    expect(profile.getExtractScriptPath()).toBe("extract-1110.sh");
    expect(profile.getSourceAuthConfigurationPath()).toBe("bnetserver.1110.conf.dist");
    expect(profile.getSourceWorldConfigurationPath()).toBe("worldserver.1110.conf.dist");
    expect(profile.getInitializer()).toBeInstanceOf(InitializerRegular);
  });
});
