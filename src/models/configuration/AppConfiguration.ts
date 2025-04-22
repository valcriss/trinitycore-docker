import DatabaseConfiguration from "../types/DatabaseConfiguration";

class AppConfiguration {
  private username: string | null = null;
  private password: string | null = null;
  private databaseHost: string | null = 'database';
  private databasePort: string | null = '3306';
  private rootDatabasePassword: string | null = 'trinityroot';
  private databaseUser: string | null = 'trinity';
  private databasePassword: string | null = 'trinity';
  private realmName: string | null = 'TrinityCore';
  private publicIpAddress: string | null = '127.0.0.1';

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration() {
    this.username = process.env.ACCESS_USERNAME || null;
    this.password = process.env.ACCESS_PASSWORD || null;
    this.realmName = process.env.REALM_NAME || 'TrinityCore';
    this.publicIpAddress = process.env.PUBLIC_IP_ADDRESS || '127.0.0.1';
  }

  public getAccessUsername(): string | null {
    return this.username;
  }

  public getAccessPassword(): string | null {
    return this.password;
  }

  public getDatabaseHost(): string | null {
    return this.databaseHost;
  }

  public getDatabasePort(): string | null {
    return this.databasePort;
  }

  public getRootDatabasePassword(): string | null {
    return this.rootDatabasePassword;
  }

  public getDatabaseUser(): string | null {
    return this.databaseUser;
  }

  public getDatabasePassword(): string | null {
    return this.databasePassword;
  }

  public getRealmName(): string | null {
    return this.realmName;
  }

  public getPublicIpAddress(): string | null {
    return this.publicIpAddress;
  }

  public getDatabaseConfiguration(): DatabaseConfiguration {
    return {
      root: {
        host: this.getDatabaseHost(),
        port: this.getDatabasePort(),
        user: 'root',
        password: this.getRootDatabasePassword()
      },
      auth: {
        host: this.getDatabaseHost(),
        port: this.getDatabasePort(),
        user: this.getDatabaseUser(),
        password: this.getDatabasePassword(),
        database: 'auth',
      },
      world: {
        host: this.getDatabaseHost(),
        port: this.getDatabasePort(),
        user: this.getDatabaseUser(),
        password: this.getDatabasePassword(),
        database: 'world',
      },
      characters: {
        host: this.getDatabaseHost(),
        port: this.getDatabasePort(),
        user: this.getDatabaseUser(),
        password: this.getDatabasePassword(),
        database: 'characters',
      },
      hotfixes: {
        host: this.getDatabaseHost(),
        port: this.getDatabasePort(),
        user: this.getDatabaseUser(),
        password: this.getDatabasePassword(),
        database: 'hotfixes',
      }
    };
  }

}

export default new AppConfiguration();