import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import CommandExecuter from "../../../src/models/tools/CommandExecuter";

const spawnMock = vi.fn();

vi.mock("child_process", () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

const createProcess = () => {
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const handlers: Record<string, (arg?: any) => void> = {};
  const proc = {
    stdin: { write: vi.fn() },
    stdout,
    stderr,
    on: vi.fn((event: string, handler: (arg?: any) => void) => {
      handlers[event] = handler;
    }),
    handlers,
  };
  return proc;
};

describe("CommandExecuter", () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it("executes a command and handles output", async () => {
    const proc = createProcess();
    spawnMock.mockReturnValue(proc);
    const onStdout = vi.fn();
    const onStderr = vi.fn();
    const onClose = vi.fn();

    const executer = new CommandExecuter(true);
    const promise = executer.execute("cmd", ["arg"], "/tmp", onStdout, onStderr, onClose);

    proc.stdout.emit("data", Buffer.from("out"));
    proc.stderr.emit("data", Buffer.from("err"));
    proc.handlers.close(0);

    const result = await promise;
    expect(result).toBe(true);
    expect(onStdout).toHaveBeenCalled();
    expect(onStderr).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(0);
  });

  it("returns false when command fails", async () => {
    const proc = createProcess();
    spawnMock.mockReturnValue(proc);
    const executer = new CommandExecuter();

    const promise = executer.execute("cmd", [], "/tmp");
    proc.handlers.close(1);

    await expect(promise).rejects.toThrow("Process exited with code 1");
  });

  it("handles execution errors", async () => {
    const proc = createProcess();
    spawnMock.mockReturnValue(proc);
    const executer = new CommandExecuter();

    const promise = executer.execute("cmd", [], "/tmp");
    proc.handlers.error(new Error("boom"));

    await expect(promise).rejects.toThrow("Erreur lors de l");
  });

  it("sends data to stdin when running", async () => {
    const proc = createProcess();
    spawnMock.mockReturnValue(proc);
    const executer = new CommandExecuter();

    const promise = executer.execute("cmd", [], "/tmp");
    executer.send("status");
    proc.handlers.close(0);
    await promise;

    expect(proc.stdin.write).toHaveBeenCalledWith("status\n");
  });
});
