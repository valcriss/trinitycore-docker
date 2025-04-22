import InitializerRegular from "../initializer/InitializerRegular";
import IProfile from "./IProfile";

class Profile335 implements IProfile {
  getName(): string {
    return "WoW 3.3.5a (Wrath of the Lich King)";
  }
  getAuthServerBinary(): string {
    return "/app/server/bin/authserver";
  }
  getWorldServerBinary(): string {
    return "/app/server/bin/worldserver";
  }
  getAuthServerConfigurationPath(): string {
    return "/app/server/etc/authserver.conf";
  }
  getWorldServerConfigurationPath(): string {
    return "/app/server/etc/worldserver.conf";
  }
  getInitializeDatabasePath(): string {
    return "create-mysql-335.sql";
  }
  getInitialDatabaseNamePattern(): string {
    return "TDB_full_world_335";
  }
  getExtractScriptPath(): string {
    return "extract-335.sh";
  }
  getInitializer(): IInitializer {
    return new InitializerRegular(this);
  }
  getSourceAuthConfigurationPath(): string {
    return "authserver.335.conf.dist";
  }
  getSourceWorldConfigurationPath(): string {
    return "worldserver.335.conf.dist";
  }
}

export default Profile335;