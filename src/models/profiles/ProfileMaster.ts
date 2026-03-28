import InitializerRegular from "../initializer/InitializerRegular";
import IProfile from "./IProfile";
import IInitializer from "../initializer/IInitializer";

class ProfileMaster implements IProfile {
  getName(): string {
    return "WoW master";
  }
  getAuthServerBinary(): string {
    return "/app/server/bin/bnetserver";
  }
  getWorldServerBinary(): string {
    return "/app/server/bin/worldserver";
  }
  getAuthServerConfigurationPath(): string {
    return "/app/server/etc/bnetserver.conf";
  }
  getWorldServerConfigurationPath(): string {
    return "/app/server/etc/worldserver.conf";
  }
  getInitializeDatabasePath(): string {
    return "create-mysql-master.sql";
  }
  getInitialDatabaseNamePattern(): string {
    return "TDB_full_1";
  }
  getExtractScriptPath(): string {
    return "extract-master.sh";
  }
  getInitializer(): IInitializer {
    return new InitializerRegular(this);
  }
  getSourceAuthConfigurationPath(): string {
    return "bnetserver.master.conf.dist";
  }
  getSourceWorldConfigurationPath(): string {
    return "worldserver.master.conf.dist";
  }
}

export default ProfileMaster;
