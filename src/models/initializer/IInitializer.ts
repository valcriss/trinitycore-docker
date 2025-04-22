interface IInitializer {
  checkDatabaseConnection(): Promise<boolean>;
  checkDatabasesStructure(): Promise<boolean>;
  checkDatabasesInitialData(): Promise<boolean>;
  updateAuthServerConfiguration(): Promise<boolean>;
  updateWorldServerConfiguration(): Promise<boolean>;
  updateApplicationDatabase(): Promise<boolean>;
  updateRealmInformations(): Promise<boolean>;
  checkClientMapData(): Promise<boolean>;
}