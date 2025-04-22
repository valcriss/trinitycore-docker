import path from "path";
import fs from "fs";
import consoleHelper from '../tools/ConsoleHelper';
import CommandExecuter from "../tools/CommandExecuter";
import IProfile from "../profiles/IProfile";

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
    if (!await commandExecuter.execute('/app/backend/resources/' + this.profile.getExtractScriptPath(), [], '/app/backend/')) {
      return false;
    }
    return true;
  }

}

export default MapInitializer;