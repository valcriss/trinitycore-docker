import InitializerRegular from "../initializer/InitializerRegular";
import IProfile from "./IProfile";

class Profile442 implements IProfile {
  getName(): string {
    return "WoW 4.4.2 (Cataclysm)";
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
    return "create-mysql-442.sql";
  }
  getInitialDatabaseNamePattern(): string {
    return "TDB_full_4";
  }
  getExtractScriptPath(): string {
    return "extract-442.sh";
  }
  getInitializer(): IInitializer {
    return new InitializerRegular(this);
  }
  getSourceAuthConfigurationPath(): string {
    return "bnetserver.442.conf.dist";
  }
  getSourceWorldConfigurationPath(): string {
    return "worldserver.442.conf.dist";
  }
}

export default Profile442;