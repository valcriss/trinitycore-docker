class AppInitializer {

  private initializer: IInitializer;

  constructor(initializer: IInitializer) {
    this.initializer = initializer;
  }

  public async initialize(): Promise<boolean> {

    if (!await this.initializer.checkDatabaseConnection()) {
      return false;
    }

    if (!await this.initializer.checkDatabasesStructure()) {
      return false;
    }

    if (!await this.initializer.checkDatabasesInitialData()) {
      return false;
    }

    if (!this.initializer.updateAuthServerConfiguration()) {
      return false;
    }

    if (!this.initializer.updateWorldServerConfiguration()) {
      return false;
    }

    if (!await this.initializer.updateApplicationDatabase()) {
      return false;
    }
 
    if (!await this.initializer.updateRealmInformations()) {
      return false;
    }

    if (!await this.initializer.checkClientMapData()) {
      return false;
    }

    return true;
  }

}

export default AppInitializer;