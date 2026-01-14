import { describe, it, expect, vi, beforeEach } from "vitest";
import type DatabaseConfiguration from "../../../src/models/types/DatabaseConfiguration";
import Database from "../../../src/models/database/Database";

const createConnectionMock = vi.fn();

vi.mock("mysql2/promise", () => ({
  default: {
    createConnection: (...args: unknown[]) => createConnectionMock(...args),
  },
}));

const baseConfig: DatabaseConfiguration = {
  root: {
    host: "db",
    port: "3306",
    user: "root",
    password: "rootpw",
  },
  auth: {
    host: "db",
    port: "3306",
    user: "user",
    password: "pass",
    database: "auth",
  },
  world: {
    host: null,
    port: null,
    user: null,
    password: null,
    database: null,
  },
  characters: {
    host: "db",
    port: "3306",
    user: "user",
    password: "pass",
    database: "characters",
  },
  hotfixes: {
    host: "db",
    port: "3306",
    user: "user",
    password: "pass",
    database: "hotfixes",
  },
};

describe("Database", () => {
  beforeEach(() => {
    createConnectionMock.mockReset();
  });

  it("connects successfully and uses normalized options", async () => {
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ end });

    const database = new Database(baseConfig);
    const result = await database.checkConnection("root", 1, 0);

    expect(result).toBe(true);
    expect(createConnectionMock).toHaveBeenCalledTimes(1);
    expect(createConnectionMock).toHaveBeenCalledWith({
      host: "db",
      port: 3306,
      user: "root",
      password: "rootpw",
      database: undefined,
    });
    expect(end).toHaveBeenCalled();
  });

  it("retries and returns false after failures", async () => {
    createConnectionMock.mockRejectedValue(new Error("fail"));
    const database = new Database(baseConfig);
    const attemptFailed = vi.fn();

    vi.useFakeTimers();
    const promise = database.checkConnection("root", 2, 0, attemptFailed);
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();

    expect(result).toBe(false);
    expect(attemptFailed).toHaveBeenCalledTimes(2);
  });

  it("checks initialization status", async () => {
    const execute = vi.fn().mockResolvedValue([[{ SCHEMA_NAME: "auth" }], []]);
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ execute, end });

    const database = new Database(baseConfig);
    const result = await database.isInitialized();

    expect(result).toBe(true);
    expect(execute).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });

  it("checks whether database contains data", async () => {
    const execute = vi.fn().mockResolvedValue([[{ count: 2 }], []]);
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ execute, end });

    const database = new Database(baseConfig);
    const result = await database.containsData();

    expect(result).toBe(true);
    expect(execute).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });

  it("executes queries with params", async () => {
    const execute = vi.fn().mockResolvedValue([[{ ok: true }], []]);
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ execute, end });

    const database = new Database(baseConfig);
    const result = await database.execute("auth", "SELECT 1", [1]);

    expect(result).toEqual([{ ok: true }]);
    expect(execute).toHaveBeenCalledWith("SELECT 1", [1]);
    expect(end).toHaveBeenCalled();
  });

  it("normalizes optional fields for database connections", async () => {
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ end });

    const database = new Database(baseConfig);
    await database.checkConnection("auth", 1, 0);

    expect(createConnectionMock).toHaveBeenCalledWith({
      host: "db",
      port: 3306,
      user: "user",
      password: "pass",
      database: "auth",
    });
  });

  it("passes undefined params to execute when no params are provided", async () => {
    const execute = vi.fn().mockResolvedValue([[{ ok: true }], []]);
    const end = vi.fn();
    createConnectionMock.mockResolvedValue({ execute, end });

    const database = new Database(baseConfig);
    await database.execute("world", "SELECT 1", null);

    expect(createConnectionMock).toHaveBeenCalledWith({
      host: undefined,
      port: undefined,
      user: undefined,
      password: undefined,
      database: undefined,
    });
    expect(execute).toHaveBeenCalledWith("SELECT 1", undefined);
  });
});
