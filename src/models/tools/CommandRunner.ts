import CommandExecuter from "./CommandExecuter";

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

  start(onUpdate: Function | null = null) {
    this.commandExecuter.execute(this.binaryPath, this.params, this.binaryCwd, (stdout: any) => {
      this.buffer += stdout.toString();
      this.truncateBuffer();
      if (onUpdate) {
        onUpdate();
      }
    }, (stderr: any) => {
      this.buffer += stderr.toString();
      this.truncateBuffer();
      if (onUpdate) {
        onUpdate();
      }
    }, (code: number) => {
      this.code = code;
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