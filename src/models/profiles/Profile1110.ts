import InitializerRegular from "../initializer/InitializerRegular";
import IProfile from "./IProfile";

class Profile1110 implements IProfile {
  getName(): string {
    return "WoW 11.1.0 (Dragonflight)";
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
    return "create-mysql-1110.sql";
  }
  getInitialDatabaseNamePattern(): string {
    return "TDB_full_1";
  }
  getExtractScriptPath(): string {
    return "extract-1110.sh";
  }
  getInitializer(): IInitializer {
    return new InitializerRegular(this);
  }
  getSourceAuthConfigurationPath(): string {
    return "bnetserver.1110.conf.dist";
  }
  getSourceWorldConfigurationPath(): string {
    return "worldserver.1110.conf.dist";
  }
}

export default Profile1110;