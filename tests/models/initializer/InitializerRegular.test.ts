import { describe, it, expect, vi, beforeEach } from "vitest";
import InitializerRegular from "../../../src/models/initializer/InitializerRegular";

const databaseMock = {
  checkConnection: vi.fn(),
  isInitialized: vi.fn(),
  containsData: vi.fn(),
};

const databaseInitializerMock = {
  initialize: vi.fn(),
  downloadInitialData: vi.fn(),
  updateApplicationDatabase: vi.fn(),
  updateRealmInformations: vi.fn(),
};

const configurationWriterMock = {
  writeAuthServerConfiguration: vi.fn(),
  writeWorldServerConfiguration: vi.fn(),
};

const mapInitializerMock = {
  isClientMapInitialized: vi.fn(),
  initialize: vi.fn(),
};

vi.mock("../../../src/models/tools/ConsoleHelper", () => ({
  default: {
    beginBox: vi.fn(),
    endBox: vi.fn(),
    writeBoxLine: vi.fn(),
  },
}));

vi.mock("../../../src/models/database/Database", () => ({
  default: class {
    constructor() {
      Object.assign(this, databaseMock);
    }
  },
}));

vi.mock("../../../src/models/initializer/DatabaseInitializer", () => ({
  default: class {
    constructor() {
      Object.assign(this, databaseInitializerMock);
    }
  },
}));

vi.mock("../../../src/models/initializer/ConfigurationWriter", () => ({
  default: class {
    constructor() {
      Object.assign(this, configurationWriterMock);
    }
  },
}));

vi.mock("../../../src/models/initializer/MapInitializer", () => ({
  default: class {
    constructor() {
      Object.assign(this, mapInitializerMock);
    }
  },
}));

describe("InitializerRegular", () => {
  const profile = {} as never;

  beforeEach(() => {
    databaseMock.checkConnection.mockReset();
    databaseMock.isInitialized.mockReset();
    databaseMock.containsData.mockReset();
    databaseInitializerMock.initialize.mockReset();
    databaseInitializerMock.downloadInitialData.mockReset();
    databaseInitializerMock.updateApplicationDatabase.mockReset();
    databaseInitializerMock.updateRealmInformations.mockReset();
    configurationWriterMock.writeAuthServerConfiguration.mockReset();
    configurationWriterMock.writeWorldServerConfiguration.mockReset();
    mapInitializerMock.isClientMapInitialized.mockReset();
    mapInitializerMock.initialize.mockReset();
  });

  it("checks database connection", async () => {
    databaseMock.checkConnection.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabaseConnection();

    expect(result).toBe(true);
    expect(databaseMock.checkConnection).toHaveBeenCalled();
  });

  it("reports failed connection attempts", async () => {
    databaseMock.checkConnection.mockImplementation((_db, _attempts, _delay, onFail) => {
      onFail?.(1, 2);
      return Promise.resolve(true);
    });
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabaseConnection();

    expect(result).toBe(true);
  });

  it("returns false when database connection fails", async () => {
    databaseMock.checkConnection.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabaseConnection();

    expect(result).toBe(false);
  });

  it("initializes database structure when needed", async () => {
    databaseMock.isInitialized.mockResolvedValue(false);
    databaseInitializerMock.initialize.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesStructure();

    expect(result).toBe(true);
    expect(databaseInitializerMock.initialize).toHaveBeenCalled();
  });

  it("returns false when structure initialization fails", async () => {
    databaseMock.isInitialized.mockResolvedValue(false);
    databaseInitializerMock.initialize.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesStructure();

    expect(result).toBe(false);
  });

  it("returns true when databases are already initialized", async () => {
    databaseMock.isInitialized.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesStructure();

    expect(result).toBe(true);
    expect(databaseInitializerMock.initialize).not.toHaveBeenCalled();
  });

  it("checks initial data and downloads when empty", async () => {
    databaseMock.containsData.mockResolvedValue(false);
    databaseInitializerMock.downloadInitialData.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesInitialData();

    expect(result).toBe(true);
    expect(databaseInitializerMock.downloadInitialData).toHaveBeenCalled();
  });

  it("returns false when initial data download fails", async () => {
    databaseMock.containsData.mockResolvedValue(false);
    databaseInitializerMock.downloadInitialData.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesInitialData();

    expect(result).toBe(false);
  });

  it("returns true when databases already contain data", async () => {
    databaseMock.containsData.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkDatabasesInitialData();

    expect(result).toBe(true);
    expect(databaseInitializerMock.downloadInitialData).not.toHaveBeenCalled();
  });

  it("updates auth configuration", async () => {
    configurationWriterMock.writeAuthServerConfiguration.mockReturnValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateAuthServerConfiguration();

    expect(result).toBe(true);
  });

  it("returns false when auth configuration fails", async () => {
    configurationWriterMock.writeAuthServerConfiguration.mockReturnValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateAuthServerConfiguration();

    expect(result).toBe(false);
  });

  it("updates world configuration", async () => {
    configurationWriterMock.writeWorldServerConfiguration.mockReturnValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateWorldServerConfiguration();

    expect(result).toBe(true);
  });

  it("returns false when world configuration fails", async () => {
    configurationWriterMock.writeWorldServerConfiguration.mockReturnValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateWorldServerConfiguration();

    expect(result).toBe(false);
  });

  it("updates application database", async () => {
    databaseInitializerMock.updateApplicationDatabase.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateApplicationDatabase();

    expect(result).toBe(true);
  });

  it("returns false when application database update fails", async () => {
    databaseInitializerMock.updateApplicationDatabase.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateApplicationDatabase();

    expect(result).toBe(false);
  });

  it("updates realm informations", async () => {
    databaseInitializerMock.updateRealmInformations.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateRealmInformations();

    expect(result).toBe(true);
  });

  it("returns false when realm informations update fails", async () => {
    databaseInitializerMock.updateRealmInformations.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.updateRealmInformations();

    expect(result).toBe(false);
  });

  it("initializes map data when missing", async () => {
    mapInitializerMock.isClientMapInitialized.mockReturnValue(false);
    mapInitializerMock.initialize.mockResolvedValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkClientMapData();

    expect(result).toBe(true);
    expect(mapInitializerMock.initialize).toHaveBeenCalled();
  });

  it("returns false when map initialization fails", async () => {
    mapInitializerMock.isClientMapInitialized.mockReturnValue(false);
    mapInitializerMock.initialize.mockResolvedValue(false);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkClientMapData();

    expect(result).toBe(false);
  });

  it("skips map initialization when data is present", async () => {
    mapInitializerMock.isClientMapInitialized.mockReturnValue(true);
    const initializer = new InitializerRegular(profile);

    const result = await initializer.checkClientMapData();

    expect(result).toBe(true);
    expect(mapInitializerMock.initialize).not.toHaveBeenCalled();
  });
});
