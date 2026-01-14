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

  constructor(binaryPath: string, params: Array<string>, binaryCwd: string) {
    this.binaryCwd = binaryCwd;
    this.params = params;
    this.binaryPath = binaryPath;
    this.commandExecuter = new CommandExecuter();
    this.buffer = '';
    this.running = false;
    this.code = 0;
  }

  start(onUpdate: UpdateHandler | null = null) {
    this.commandExecuter.execute(this.binaryPath, this.params, this.binaryCwd, (stdout: Buffer) => {
      this.buffer += stdout.toString();
      this.truncateBuffer();
      if (onUpdate) {
        onUpdate();
      }
    }, (stderr: Buffer) => {
      this.buffer += stderr.toString();
      this.truncateBuffer();
      if (onUpdate) {
        onUpdate();
      }
    }, (code: number | null) => {
      this.code = code ?? 0;
      this.running = false;
      if (onUpdate) {
        onUpdate();
      }
    });
    this.running = true;
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

  truncateBuffer() {
    const lines = this.buffer.split('\n');
    if (lines.length > 1000) {
      this.buffer = lines.slice(-1000).join('\n');
    }
  }
}

export default CommandRunner;
