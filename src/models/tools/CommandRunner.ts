import CommandExecuter from "./CommandExecuter";

type UpdateHandler = () => void;

class CommandRunner {

  private binaryPath: string;
  private params: Array<string>;
  private binaryCwd: string;
  private commandExecuter: CommandExecuter;
  private buffer: string;
  private running: boolean;
  private code: number;
  private startedAt: string | null;
  private lastUpdatedAt: string | null;

  constructor(binaryPath: string, params: Array<string>, binaryCwd: string) {
    this.binaryCwd = binaryCwd;
    this.params = params;
    this.binaryPath = binaryPath;
    this.commandExecuter = new CommandExecuter();
    this.buffer = '';
    this.running = false;
    this.code = 0;
    this.startedAt = null;
    this.lastUpdatedAt = null;
  }

  start(onUpdate: UpdateHandler | null = null) {
    this.commandExecuter.execute(this.binaryPath, this.params, this.binaryCwd, (stdout: Buffer) => {
      this.buffer += stdout.toString();
      this.truncateBuffer();
      this.lastUpdatedAt = new Date().toISOString();
      if (onUpdate) {
        onUpdate();
      }
    }, (stderr: Buffer) => {
      this.buffer += stderr.toString();
      this.truncateBuffer();
      this.lastUpdatedAt = new Date().toISOString();
      if (onUpdate) {
        onUpdate();
      }
    }, (code: number | null) => {
      this.code = code ?? 0;
      this.running = false;
      this.lastUpdatedAt = new Date().toISOString();
      if (onUpdate) {
        onUpdate();
      }
    }).catch((error: Error) => {
      this.buffer += `\n[process-error] ${error.message}\n`;
      this.truncateBuffer();
      this.running = false;
      this.lastUpdatedAt = new Date().toISOString();
      if (onUpdate) {
        onUpdate();
      }
    });
    this.running = true;
    this.code = 0;
    this.startedAt = new Date().toISOString();
    this.lastUpdatedAt = this.startedAt;
    if (onUpdate) {
      onUpdate();
    }
  }

  send(command: string) {
    if (this.running) {
      this.commandExecuter.send(command);
    }
  }

  getOutput() {
    return this.buffer;
  }

  isRunning() {
    return this.running;
  }

  getCode() {
    return this.code;
  }

  getStartedAt() {
    return this.startedAt;
  }

  getLastUpdatedAt() {
    return this.lastUpdatedAt;
  }

  truncateBuffer() {
    const lines = this.buffer.split('\n');
    if (lines.length > 1000) {
      this.buffer = lines.slice(-1000).join('\n');
    }
  }
}

export default CommandRunner;
