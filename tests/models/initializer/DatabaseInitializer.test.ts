import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import type GithubRelease from "../../../src/models/types/GithubRelease";
import DatabaseInitializer from "../../../src/models/initializer/DatabaseInitializer";

const readFileSyncMock = vi.fn();
const unlinkSyncMock = vi.fn();

vi.mock("fs", () => ({
  default: {
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
    unlinkSync: (...args: unknown[]) => unlinkSyncMock(...args),
  },
  readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  unlinkSync: (...args: unknown[]) => unlinkSyncMock(...args),
}));

const downloadFileMock = vi.fn();
vi.mock("../../../src/models/tools/FileDownloader", () => ({
  default: class {
    downloadFile = downloadFileMock;
  },
}));

const executeMock = vi.fn();
vi.mock("../../../src/models/tools/CommandExecuter", () => ({
  default: class {
    execute = executeMock;
  },
}));

const configMock = vi.hoisted(() => ({
  getDatabaseUser: vi.fn(),
  getDatabasePassword: vi.fn(),
  getRealmName: vi.fn(),
  getPublicIpAddress: vi.fn(),
}));

vi.mock("../../../src/models/configuration/AppConfiguration", () => ({
  default: configMock,
}));

let requestMock: (...args: unknown[]) => any;
vi.mock("https", () => ({
  default: {
    request: (...args: unknown[]) => requestMock(...args),
  },
}));

const makeProfile = () => ({
  getInitializeDatabasePath: () => "init.sql",
  getInitialDatabaseNamePattern: () => "TDB_full",
  getExtractScriptPath: () => "extract.sh",
});

describe("DatabaseInitializer", () => {
  beforeEach(() => {
    readFileSyncMock.mockReset();
    unlinkSyncMock.mockReset();
    downloadFileMock.mockReset();
    executeMock.mockReset();
    configMock.getDatabaseUser.mockReturnValue("dbuser");
    configMock.getDatabasePassword.mockReturnValue("dbpass");
    configMock.getRealmName.mockReturnValue("Realm");
    configMock.getPublicIpAddress.mockReturnValue("1.2.3.4");
  });

  it("initializes the database using SQL file", async () => {
    readFileSyncMock.mockReturnValue("CREATE <DATABASE_USER>;INSERT <DATABASE_PASSWORD>;");
    const database = { execute: vi.fn().mockResolvedValue(true) };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const result = await initializer.initialize();

    expect(result).toBe(true);
    expect(database.execute).toHaveBeenCalledTimes(2);
  });

  it("returns false when initialization fails", async () => {
    readFileSyncMock.mockImplementation(() => {
      throw new Error("read error");
    });
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const result = await initializer.initialize();

    expect(result).toBe(false);
  });

  it("replaces null placeholders with empty strings", async () => {
    readFileSyncMock.mockReturnValue("CREATE <DATABASE_USER>;<DATABASE_PASSWORD>;");
    configMock.getDatabaseUser.mockReturnValue(null);
    configMock.getDatabasePassword.mockReturnValue(null);
    const database = { execute: vi.fn().mockResolvedValue(true) };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const result = await initializer.initialize();

    expect(result).toBe(true);
    expect(database.execute).toHaveBeenCalledWith("root", "CREATE ");
  });

  it("downloads and extracts initial data", async () => {
    const releases: GithubRelease[] = [
      {
        tag_name: "v1",
        name: "release",
        body: "",
        html_url: "",
        published_at: "",
        assets: [
          { name: "TDB_full_world_335.7z", browser_download_url: "http://file", size: 1, content_type: "application/zip" },
        ],
      },
    ];
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);
    vi.spyOn(initializer as never, "fetchTrinityCoreReleases").mockResolvedValue(releases);

    downloadFileMock.mockResolvedValue(undefined);
    executeMock.mockResolvedValue(true);

    const result = await initializer.downloadInitialData();

    expect(result).toBe(true);
    expect(downloadFileMock).toHaveBeenCalled();
    expect(unlinkSyncMock).toHaveBeenCalled();
  });

  it("returns false when no matching release is found", async () => {
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);
    vi.spyOn(initializer as never, "fetchTrinityCoreReleases").mockResolvedValue([]);

    const result = await initializer.downloadInitialData();

    expect(result).toBe(false);
  });

  it("returns false when extraction fails", async () => {
    const releases: GithubRelease[] = [
      {
        tag_name: "v1",
        name: "release",
        body: "",
        html_url: "",
        published_at: "",
        assets: [
          { name: "TDB_full_world_335.7z", browser_download_url: "http://file", size: 1, content_type: "application/zip" },
        ],
      },
    ];
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);
    vi.spyOn(initializer as never, "fetchTrinityCoreReleases").mockResolvedValue(releases);

    downloadFileMock.mockResolvedValue(undefined);
    executeMock.mockResolvedValue(false);

    const result = await initializer.downloadInitialData();

    expect(result).toBe(false);
  });

  it("returns false when release fetch fails", async () => {
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);
    vi.spyOn(initializer as never, "fetchTrinityCoreReleases").mockRejectedValue(new Error("fail"));

    const result = await initializer.downloadInitialData();

    expect(result).toBe(false);
  });

  it("updates the application database", async () => {
    executeMock.mockResolvedValue(true);
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const result = await initializer.updateApplicationDatabase();

    expect(result).toBe(true);
    expect(executeMock).toHaveBeenCalled();
  });

  it("returns false when the application database update fails", async () => {
    executeMock.mockResolvedValue(false);
    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const result = await initializer.updateApplicationDatabase();

    expect(result).toBe(false);
  });

  it("updates realm information and handles errors", async () => {
    const database = { execute: vi.fn().mockResolvedValue(true) };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    const ok = await initializer.updateRealmInformations();
    expect(ok).toBe(true);

    configMock.getRealmName.mockReturnValue(null);
    configMock.getPublicIpAddress.mockReturnValue(null);
    const defaultDatabase = { execute: vi.fn().mockResolvedValue(true) };
    const defaultInitializer = new DatabaseInitializer(defaultDatabase as never, makeProfile() as never);
    await defaultInitializer.updateRealmInformations();
    expect(defaultDatabase.execute).toHaveBeenCalledWith("auth", expect.any(String), [
      "TrinityCore",
      "127.0.0.1",
      1,
    ]);

    const errorDatabase = { execute: vi.fn().mockRejectedValue(new Error("fail")) };
    const errorInitializer = new DatabaseInitializer(errorDatabase as never, makeProfile() as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const fail = await errorInitializer.updateRealmInformations();
    expect(fail).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("fetches releases from GitHub", async () => {
    requestMock = (options: unknown, callback: (res: EventEmitter) => void) => {
      const res = new EventEmitter();
      callback(res);
      const req = new EventEmitter() as EventEmitter & { end: () => void; on: (event: string, handler: () => void) => void };
      req.on = req.on.bind(req);
      req.end = () => {
        res.emit("data", JSON.stringify([{ tag_name: "v1" }]));
        res.emit("end");
      };
      return req;
    };

    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);
    const result = await (initializer as never).fetchTrinityCoreReleases();

    expect(result[0].tag_name).toBe("v1");
  });

  it("rejects when GitHub response is invalid JSON", async () => {
    requestMock = (options: unknown, callback: (res: EventEmitter) => void) => {
      const res = new EventEmitter();
      callback(res);
      const req = new EventEmitter() as EventEmitter & { end: () => void; on: (event: string, handler: () => void) => void };
      req.on = req.on.bind(req);
      req.end = () => {
        res.emit("data", "not-json");
        res.emit("end");
      };
      return req;
    };

    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    await expect((initializer as never).fetchTrinityCoreReleases()).rejects.toThrow("Erreur lors du parsing JSON");
  });

  it("rejects when request fails", async () => {
    requestMock = (options: unknown, callback: (res: EventEmitter) => void) => {
      const res = new EventEmitter();
      callback(res);
      const req = new EventEmitter() as EventEmitter & {
        end: () => void;
        on: (event: string, handler: (error: Error) => void) => void;
      };
      const handlers: Record<string, (error: Error) => void> = {};
      req.on = (event: string, handler: (error: Error) => void) => {
        handlers[event] = handler;
        return req;
      };
      req.end = () => {
        handlers.error?.(new Error("fail"));
      };
      return req;
    };

    const database = { execute: vi.fn() };
    const initializer = new DatabaseInitializer(database as never, makeProfile() as never);

    await expect((initializer as never).fetchTrinityCoreReleases()).rejects.toThrow("Erreur lors de la requ");
  });
});
