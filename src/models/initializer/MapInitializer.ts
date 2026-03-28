import path from "path";
import fs from "fs";
import consoleHelper from '../tools/ConsoleHelper';
import CommandExecuter from "../tools/CommandExecuter";
import IProfile from "../profiles/IProfile";
import bootstrapTracker from "../bootstrap/BootstrapTracker";

class MapInitializer {
  private profile: IProfile;

  constructor(profile: IProfile) {
    this.profile = profile;
  }

  isClientMapInitialized() {
    const mapsPath = path.join('/app/server/data/maps');
    return fs.existsSync(mapsPath);
  }

  async initialize() {
    const commandExecuter = new CommandExecuter();
    consoleHelper.writeBoxLine('Extracting data from client files...');
    bootstrapTracker.updateStepProgress("client-data", 5, "Launching extraction helpers...");
    if (!await commandExecuter.execute(
      '/app/backend/resources/' + this.profile.getExtractScriptPath(),
      [],
      '/app/backend/',
      (stdout: Buffer) => {
        bootstrapTracker.addLog(stdout.toString(), "client-data");
      },
      (stderr: Buffer) => {
        bootstrapTracker.addLog(stderr.toString(), "client-data");
      }
    )) {
      return false;
    }

    if (!this.isClientMapInitialized()) {
      bootstrapTracker.addLog("Extraction finished but /app/server/data/maps is still missing.", "client-data");
      return false;
    }

    bootstrapTracker.updateStepProgress("client-data", 100, "Client assets extracted.");
    return true;
  }

}

export default MapInitializer;
