import IInitializer from "./IInitializer";
import bootstrapTracker, { BootstrapStepId } from "../bootstrap/BootstrapTracker";

class AppInitializer {

  private initializer: IInitializer;

  constructor(initializer: IInitializer) {
    this.initializer = initializer;
  }

  public async initialize(): Promise<boolean> {
    bootstrapTracker.reset();
    bootstrapTracker.beginInitialization("Container started. Preparing the TrinityCore environment...");

    const steps: Array<{
      id: BootstrapStepId;
      startMessage: string;
      successMessage: string;
      failureMessage: string;
      run: () => Promise<boolean>;
    }> = [
      {
        id: "database-connection",
        startMessage: "Connecting to MySQL...",
        successMessage: "Database connection established.",
        failureMessage: "Unable to connect to MySQL.",
        run: () => this.initializer.checkDatabaseConnection(),
      },
      {
        id: "database-structure",
        startMessage: "Checking TrinityCore schemas...",
        successMessage: "Database structure is ready.",
        failureMessage: "Database structure initialization failed.",
        run: () => this.initializer.checkDatabasesStructure(),
      },
      {
        id: "database-seed",
        startMessage: "Preparing initial TrinityCore data...",
        successMessage: "Initial database content is ready.",
        failureMessage: "Initial database content could not be prepared.",
        run: () => this.initializer.checkDatabasesInitialData(),
      },
      {
        id: "auth-config",
        startMessage: "Generating auth configuration...",
        successMessage: "Auth configuration generated.",
        failureMessage: "Auth configuration generation failed.",
        run: () => this.initializer.updateAuthServerConfiguration(),
      },
      {
        id: "world-config",
        startMessage: "Generating world configuration...",
        successMessage: "World configuration generated.",
        failureMessage: "World configuration generation failed.",
        run: () => this.initializer.updateWorldServerConfiguration(),
      },
      {
        id: "database-update",
        startMessage: "Applying TrinityCore database updates...",
        successMessage: "Database updates applied.",
        failureMessage: "Database update step failed.",
        run: () => this.initializer.updateApplicationDatabase(),
      },
      {
        id: "realm-update",
        startMessage: "Updating realm information...",
        successMessage: "Realm information updated.",
        failureMessage: "Realm information update failed.",
        run: () => this.initializer.updateRealmInformations(),
      },
      {
        id: "client-data",
        startMessage: "Checking extracted client data...",
        successMessage: "Client data is ready.",
        failureMessage: "Client data extraction failed.",
        run: () => this.initializer.checkClientMapData(),
      },
    ];

    for (const step of steps) {
      bootstrapTracker.markStepRunning(step.id, step.startMessage);
      if (!await step.run()) {
        bootstrapTracker.markStepError(step.id, step.failureMessage);
        bootstrapTracker.markFailed(step.failureMessage);
        return false;
      }

      bootstrapTracker.markStepSuccess(step.id, step.successMessage);
    }

    bootstrapTracker.markReady("Initialization complete. Starting TrinityCore services...");
    return true;
  }

}

export default AppInitializer;
