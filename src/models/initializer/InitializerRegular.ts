import consoleHelper from '../tools/ConsoleHelper';
import Database from '../database/Database';
import IProfile from '../profiles/IProfile';
import configuration from '../configuration/AppConfiguration';
import DatabaseInitializer from './DatabaseInitializer';
import ConfigurationWriter from './ConfigurationWriter';
import MapInitializer from './MapInitializer';

class InitializerRegular implements IInitializer {

  private database: Database;
  private profile: IProfile;
  private databaseInitializer: DatabaseInitializer;

  constructor(profile: IProfile) {
    this.profile = profile;
    this.database = new Database(configuration.getDatabaseConfiguration());
    this.databaseInitializer = new DatabaseInitializer(this.database, this.profile);
  }

  async checkDatabaseConnection(): Promise<boolean> {
    consoleHelper.beginBox('Checking database connection');
    if (!await this.database.checkConnection('root', 12, 5000, (attempt: number, maxAttempts: number) => {
      consoleHelper.writeBoxLine(`Failed to connect to database attempt ${attempt} of ${maxAttempts}...`);
    })) {
      consoleHelper.endBox('Connection to database failed. Exiting');
      return false;
    }
    else {
      consoleHelper.endBox('Connection to database successful.');
      return true;
    }
  }

  async checkDatabasesStructure(): Promise<boolean> {
    consoleHelper.beginBox('Checking databases structure');
    if (!await this.database.isInitialized()) {
      consoleHelper.writeBoxLine('Databases are not initialized: Initializing databases.');
      if (!await this.databaseInitializer.initialize()) {
        consoleHelper.endBox('Databases structure initialization failed. Exiting');
        return false;
      }
      else {
        consoleHelper.endBox('Databases structure initialization successful.');
        return true;
      }
    }
    else {
      consoleHelper.endBox('Databases are initialized.');
      return true;
    }
  }

  async checkDatabasesInitialData(): Promise<boolean> {
    consoleHelper.beginBox('Checking databases data');
    if (!await this.database.containsData()) {
      consoleHelper.writeBoxLine('Databases are empty: downloading initial data.');
      if (!await this.databaseInitializer.downloadInitialData()) {
        consoleHelper.endBox('Databases initial data download failed. Exiting');
        return false;
      }
      else {
        consoleHelper.endBox('Databases initial data download successful.');
        return true;
      }
    }
    else {
      consoleHelper.endBox('Databases are not empty.');
      return true;
    }
  }

  async updateAuthServerConfiguration(): Promise<boolean> {
    const configurationWriter = new ConfigurationWriter(this.profile);
    consoleHelper.beginBox('Updating auth server configuration files');
    if (!configurationWriter.writeAuthServerConfiguration()) {
      consoleHelper.endBox('Writing auth server configuration failed. Exiting');
      return false;
    }
    else {
      consoleHelper.endBox('Writing auth server configuration successful.');
      return true;
    }
  }

  async updateWorldServerConfiguration(): Promise<boolean> {
    const configurationWriter = new ConfigurationWriter(this.profile);
    consoleHelper.beginBox('Updating world server configuration files');
    if (!configurationWriter.writeWorldServerConfiguration()) {
      consoleHelper.endBox('Writing world server configuration failed. Exiting');
      return false;
    }
    else {
      consoleHelper.endBox('Writing world server configuration successful.');
      return true;
    }
  }

  async updateApplicationDatabase(): Promise<boolean> {
    consoleHelper.beginBox('Updating application database');
    if (!await this.databaseInitializer.updateApplicationDatabase()) {
      consoleHelper.endBox('Application database update failed. Exiting');
      return false;
    }
    else {
      consoleHelper.endBox('Application database update successful.');
      return true;
    }
  }

  async updateRealmInformations(): Promise<boolean> {
    consoleHelper.beginBox('Updating realm informations');
    if (!await this.databaseInitializer.updateRealmInformations()) {
      consoleHelper.endBox('Realm informations update failed. Exiting');
      return false;
    }
    else {
      consoleHelper.endBox('Realm informations update successful.');
      return true;
    }
  }

  async checkClientMapData(): Promise<boolean> {
    const mapInitializer = new MapInitializer(this.profile);
    consoleHelper.beginBox('Checking client map data');
    if (!mapInitializer.isClientMapInitialized()) {
      consoleHelper.writeBoxLine('Client map data is not present: creating client map data.');
      consoleHelper.writeBoxLine('You can grap a coffee or a tea, this will take a while (hours)...');
      if (!await mapInitializer.initialize()) {
        consoleHelper.endBox('Client map data initialization failed. Exiting');
        return false;
      }
      else {
        consoleHelper.endBox('Client map data initialization successful.');
        return true;
      }
    }
    else {
      consoleHelper.endBox('Client map data present.');
      return true;
    }
  }

}

export default InitializerRegular;