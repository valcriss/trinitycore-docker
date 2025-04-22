interface IProfile {
  getName(): string;
  getAuthServerBinary(): string;
  getWorldServerBinary(): string;
  getAuthServerConfigurationPath(): string;
  getWorldServerConfigurationPath(): string;
  getInitializeDatabasePath(): string;
  getInitialDatabaseNamePattern(): string;
  getExtractScriptPath(): string;
  getInitializer(): IInitializer;
  getSourceAuthConfigurationPath(): string;
  getSourceWorldConfigurationPath(): string;
}
export default IProfile;