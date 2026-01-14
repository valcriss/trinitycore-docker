import { describe, it, expect, vi, beforeEach } from "vitest";

let initializeResult = true;
let connectionHandler: ((socket: any) => void) | null = null;
const ioEmit = vi.fn();
const runners: Array<{ send: ReturnType<typeof vi.fn> }> = [];

vi.mock("express", () => {
  const app = { use: vi.fn() };
  const express = vi.fn(() => app);
  express.static = vi.fn(() => "static-mw");
  express.json = vi.fn(() => "json-mw");
  return { default: express };
});

vi.mock("http", () => ({
  default: {
    createServer: vi.fn(() => ({
      listen: vi.fn((port: number, cb: () => void) => {
        if (cb) {
          cb();
        }
      }),
    })),
  },
}));

vi.mock("socket.io", () => {
  class Server {
    constructor() {
      return {
        on: vi.fn((event: string, handler: (socket: any) => void) => {
          if (event === "connection") {
            connectionHandler = handler;
          }
        }),
        emit: ioEmit,
      };
    }
  }
  return { Server };
});

vi.mock("../src/routes/Authentication", () => ({ default: {} }));
vi.mock("../src/routes/Index", () => ({ default: {} }));

vi.mock("../src/models/tools/ConsoleHelper", () => ({
  default: {
    writeBox: vi.fn(),
    writeBoxLine: vi.fn(),
  },
}));

vi.mock("../src/models/profiles/ProfileLoader", () => ({
  default: {
    loadProfile: () => ({
      getName: () => "TestProfile",
      getAuthServerBinary: () => "/bin/auth",
      getWorldServerBinary: () => "/bin/world",
      getAuthServerConfigurationPath: () => "/etc/auth.conf",
      getWorldServerConfigurationPath: () => "/etc/world.conf",
      getInitializer: () => ({}),
    }),
  },
}));

vi.mock("../src/models/tools/CommandRunner", () => ({
  default: class {
    constructor() {
      const send = vi.fn();
      runners.push({ send });
      this.send = send;
    }

    send: (input: string) => void;

    start(callback?: () => void) {
      if (callback) {
        callback();
      }
    }

    getOutput() {
      return "output";
    }

    isRunning() {
      return true;
    }

    getCode() {
      return 0;
    }
  },
}));

vi.mock("../src/models/initializer/AppInitializer", () => ({
  default: class {
    initialize() {
      return Promise.resolve(initializeResult);
    }
  },
}));

describe("server", () => {
  beforeEach(() => {
    initializeResult = true;
    connectionHandler = null;
    ioEmit.mockReset();
    runners.length = 0;
    vi.resetModules();
  });

  it("stops when initialization fails", async () => {
    initializeResult = false;
    await import("../src/server");

    expect(connectionHandler).toBeNull();
  });

  it("wires socket handlers and emits state", async () => {
    initializeResult = true;
    await import("../src/server");

    expect(connectionHandler).not.toBeNull();

    const socketHandlers: Record<string, (input: string) => void> = {};
    const socket = {
      on: (event: string, handler: (input: string) => void) => {
        socketHandlers[event] = handler;
      },
      emit: vi.fn(),
    };

    connectionHandler?.(socket);

    expect(socket.emit).toHaveBeenCalledWith("authserver_state", expect.any(Object));
    expect(socket.emit).toHaveBeenCalledWith("worldserver_state", expect.any(Object));

    socketHandlers.authserver_input("auth");
    socketHandlers.worldserver_input("world");

    expect(runners[0].send).toHaveBeenCalledWith("auth");
    expect(runners[1].send).toHaveBeenCalledWith("world");
    expect(ioEmit).toHaveBeenCalledWith("authserver_state", expect.any(Object));
    expect(ioEmit).toHaveBeenCalledWith("worldserver_state", expect.any(Object));
  });
});
