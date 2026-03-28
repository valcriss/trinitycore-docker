import { describe, it, expect, vi, beforeEach } from "vitest";
import MapInitializer from "../../../src/models/initializer/MapInitializer";

const existsSyncMock = vi.fn();
vi.mock("fs", () => ({
  default: {
    existsSync: (...args: unknown[]) => existsSyncMock(...args),
  },
  existsSync: (...args: unknown[]) => existsSyncMock(...args),
}));

const executeMock = vi.fn();
vi.mock("../../../src/models/tools/CommandExecuter", () => ({
  default: class {
    execute = executeMock;
  },
}));

describe("MapInitializer", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    executeMock.mockReset();
  });

  it("detects existing client map data", () => {
    existsSyncMock.mockReturnValue(true);
    const initializer = new MapInitializer({ getExtractScriptPath: () => "extract.sh" } as never);

    expect(initializer.isClientMapInitialized()).toBe(true);
  });

  it("runs extraction when initializing", async () => {
    existsSyncMock.mockReturnValue(true);
    executeMock.mockImplementation((_cmd, _args, _cwd, stdoutCb, stderrCb) => {
      stdoutCb?.(Buffer.from("maps"));
      stderrCb?.(Buffer.from("warn"));
      return Promise.resolve(true);
    });
    const initializer = new MapInitializer({ getExtractScriptPath: () => "extract.sh" } as never);

    const result = await initializer.initialize();

    expect(result).toBe(true);
    expect(executeMock).toHaveBeenCalled();
  });

  it("returns false when extraction fails", async () => {
    executeMock.mockResolvedValue(false);
    const initializer = new MapInitializer({ getExtractScriptPath: () => "extract.sh" } as never);

    const result = await initializer.initialize();

    expect(result).toBe(false);
  });

  it("returns false when extraction command succeeds but maps are still missing", async () => {
    existsSyncMock.mockReturnValue(false);
    executeMock.mockResolvedValue(true);
    const initializer = new MapInitializer({ getExtractScriptPath: () => "extract.sh" } as never);

    const result = await initializer.initialize();

    expect(result).toBe(false);
  });
});
