import { describe, it, expect, vi, beforeEach } from "vitest";
import CommandRunner from "../../../src/models/tools/CommandRunner";

const executeMock = vi.fn();
const sendMock = vi.fn();

vi.mock("../../../src/models/tools/CommandExecuter", () => ({
  default: class {
    execute = executeMock;
    send = sendMock;
  },
}));

describe("CommandRunner", () => {
  beforeEach(() => {
    executeMock.mockReset();
    sendMock.mockReset();
  });

  it("captures output and updates state", () => {
    let onStdout: ((data: Buffer) => void) | null = null;
    let onStderr: ((data: Buffer) => void) | null = null;
    let onClose: ((code: number | null) => void) | null = null;
    executeMock.mockImplementation((_cmd, _args, _cwd, stdoutCb, stderrCb, closeCb) => {
      onStdout = stdoutCb;
      onStderr = stderrCb;
      onClose = closeCb;
      return Promise.resolve(true);
    });

    const runner = new CommandRunner("/bin/app", [], "/tmp");
    const onUpdate = vi.fn();
    runner.start(onUpdate);

    onStdout?.(Buffer.from("line1\n"));
    onStderr?.(Buffer.from("line2\n"));
    onClose?.(null);

    expect(runner.isRunning()).toBe(false);
    expect(runner.getCode()).toBe(0);
    expect(runner.getStartedAt()).not.toBeNull();
    expect(runner.getLastUpdatedAt()).not.toBeNull();
    expect(runner.getOutput()).toContain("line1");
    expect(runner.getOutput()).toContain("line2");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("truncates large output buffers", () => {
    let onStdout: ((data: Buffer) => void) | null = null;
    executeMock.mockImplementation((_cmd, _args, _cwd, stdoutCb) => {
      onStdout = stdoutCb;
      return Promise.resolve(true);
    });

    const runner = new CommandRunner("/bin/app", [], "/tmp");
    runner.start();

    const bigOutput = Array.from({ length: 1001 }, (_, i) => `line${i}`).join("\n");
    onStdout?.(Buffer.from(bigOutput));

    const lines = runner.getOutput().split("\n");
    expect(lines.length).toBeLessThanOrEqual(1000);
  });

  it("sends input to the running process", () => {
    executeMock.mockImplementation(() => Promise.resolve(true));
    const runner = new CommandRunner("/bin/app", [], "/tmp");
    runner.start();
    runner.send("status");

    expect(sendMock).toHaveBeenCalledWith("status");
  });

  it("does not send input when not running", () => {
    const runner = new CommandRunner("/bin/app", [], "/tmp");
    runner.send("status");

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("captures process failures without throwing unhandled rejections", async () => {
    executeMock.mockImplementation(() => Promise.reject(new Error("Process exited with code 1")));
    const runner = new CommandRunner("/bin/app", [], "/tmp");
    const onUpdate = vi.fn();

    runner.start(onUpdate);
    await new Promise((resolve) => setImmediate(resolve));

    expect(runner.isRunning()).toBe(false);
    expect(runner.getOutput()).toContain("[process-error] Process exited with code 1");
    expect(onUpdate).toHaveBeenCalled();
  });
});
