import { ChildProcessWithoutNullStreams, spawn } from "child_process";

class CommandExecuter {

  private process: ChildProcessWithoutNullStreams | null = null;
  private showOutput: boolean = true;
  
  constructor(showOutput: boolean = false) {
    this.showOutput = showOutput;
  }


  send(command: string): void {
    if (this.process) {
      this.process.stdin.write(command + '\n');
    }
  }

  async execute(command: string, args: Array<string>, cwd: string, onStdout: Function | null = null, onStderr: Function | null = null, onClose: Function | null = null) {
    let result = true;
    const exectPromise = new Promise<void>((resolve, reject) => {
      this.process = spawn(command, args, { cwd: cwd });

      this.process.stdout.on('data', (data) => {
        if (onStdout) {
          onStdout(data);
          if(this.showOutput) {
            console.log(data.toString());
          }
        }
      });

      this.process.stderr.on('data', (data) => {
        if (onStderr) {
          onStderr(data);
          if(this.showOutput) {
            console.log(data.toString());
          }
        }
      });

      this.process.on('close', (code) => {
        if (onClose) {
          onClose(code);
        }
        if (code === 0) {
          resolve();
        } else {
          result = false;
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      this.process.on('error', (error) => {
        result = false;
        reject(new Error(`Erreur lors de l'exécution : ${error.message}`));
      });
    });
    await exectPromise;
    this.process = null;
    return result;
  }
}

export default CommandExecuter;