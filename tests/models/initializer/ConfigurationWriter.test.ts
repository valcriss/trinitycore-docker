import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import ConfigurationWriter from "../../../src/models/initializer/ConfigurationWriter";

const makeProfile = () => ({
  getSourceAuthConfigurationPath: () => "auth.conf.dist",
  getSourceWorldConfigurationPath: () => "world.conf.dist",
  getAuthServerConfigurationPath: () => "/tmp/authserver.conf",
  getWorldServerConfigurationPath: () => "/tmp/worldserver.conf",
});

describe("ConfigurationWriter", () => {
  const readFileSync = vi.fn();
  const writeFileSync = vi.fn();
  const existsSync = vi.fn();
  const mkdirSync = vi.fn();

  beforeEach(() => {
    readFileSync.mockReset();
    writeFileSync.mockReset();
    existsSync.mockReset();
    mkdirSync.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the auth configuration with replacements", () => {
    readFileSync.mockReturnValue("host=<DATABASE_HOST> user=<DATABASE_USER>");
    existsSync.mockReturnValue(false);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);
    vi.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);
    vi.spyOn(fs, "existsSync").mockImplementation(existsSync);
    vi.spyOn(fs, "mkdirSync").mockImplementation(mkdirSync);

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = writer.writeAuthServerConfiguration();

    expect(result).toBe(true);
    expect(writeFileSync).toHaveBeenCalled();
    const content = writeFileSync.mock.calls[0][1] as string;
    expect(content).not.toContain("<DATABASE_HOST>");
  });

  it("writes the world configuration without creating an existing directory", () => {
    readFileSync.mockReturnValue("port=<DATABASE_PORT>");
    existsSync.mockReturnValue(true);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);
    vi.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);
    vi.spyOn(fs, "existsSync").mockImplementation(existsSync);

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = writer.writeWorldServerConfiguration();

    expect(result).toBe(true);
    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it("returns false on processing errors", () => {
    readFileSync.mockImplementation(() => {
      throw new Error("read error");
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = writer.writeWorldServerConfiguration();

    expect(result).toBe(false);
  });

  it("replaces null values with empty strings", () => {
    readFileSync.mockReturnValue("value=<TEST>");
    existsSync.mockReturnValue(true);

    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);
    vi.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);
    vi.spyOn(fs, "existsSync").mockImplementation(existsSync);

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = (writer as never).processConfiguration("/in", "/out/file.conf", { TEST: null });

    expect(result).toBe(true);
    expect(writeFileSync).toHaveBeenCalled();
    const content = writeFileSync.mock.calls[0][1] as string;
    expect(content).toBe("value=");
  });

  it("applies world config overrides from environment variables", () => {
    readFileSync.mockReturnValue("Rate.XP.Kill = 1\nMotd = \"Welcome\"\n");
    existsSync.mockReturnValue(true);

    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);
    vi.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);
    vi.spyOn(fs, "existsSync").mockImplementation(existsSync);

    process.env.TC_WORLD__Rate__XP__Kill = "5";
    process.env.TC_WORLD__Motd = "\"Hello from env\"";

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = writer.writeWorldServerConfiguration();

    expect(result).toBe(true);
    const content = writeFileSync.mock.calls[0][1] as string;
    expect(content).toContain("Rate.XP.Kill = 5");
    expect(content).toContain("Motd = \"Hello from env\"");

    delete process.env.TC_WORLD__Rate__XP__Kill;
    delete process.env.TC_WORLD__Motd;
  });

  it("appends missing world config keys from environment variables", () => {
    readFileSync.mockReturnValue("RealmID = 1\n");
    existsSync.mockReturnValue(true);

    vi.spyOn(fs, "readFileSync").mockImplementation(readFileSync);
    vi.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);
    vi.spyOn(fs, "existsSync").mockImplementation(existsSync);

    process.env.TC_WORLD__PlayerLimit = "500";

    const writer = new ConfigurationWriter(makeProfile() as never);
    const result = writer.writeWorldServerConfiguration();

    expect(result).toBe(true);
    const content = writeFileSync.mock.calls[0][1] as string;
    expect(content).toContain("PlayerLimit = 500");

    delete process.env.TC_WORLD__PlayerLimit;
  });
});
