import mysql from "mysql2/promise";
import DatabaseConfiguration from "../types/DatabaseConfiguration";

type DatabaseName = keyof DatabaseConfiguration;
type AttemptFailedCallback = (attempt: number, maxAttempts: number) => void;
type DatabaseConfigEntry = DatabaseConfiguration[DatabaseName];

class Database {
  private databaseConfiguration: DatabaseConfiguration;

  constructor(databaseConfiguration: DatabaseConfiguration) {
    this.databaseConfiguration = databaseConfiguration;
  }

  private getConnectionOptions(database: DatabaseName): mysql.ConnectionOptions {
    const config = this.databaseConfiguration[database] as DatabaseConfigEntry;
    return {
      host: config.host ?? undefined,
      port: config.port ? Number(config.port) : undefined,
      user: config.user ?? undefined,
      password: config.password ?? undefined,
      database: "database" in config ? config.database ?? undefined : undefined,
    };
  }

  async checkConnection(
    database: DatabaseName,
    maxAttempts: number = 12,
    delay: number = 5000,
    attemptFailed: AttemptFailedCallback | null = null
  ) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const connection = await mysql.createConnection(this.getConnectionOptions(database));
        await connection.end();
        return true; // Connection successful
      } catch (error) {
        if (attemptFailed) {
          attemptFailed(attempt, maxAttempts);
        }
        if (attempt === maxAttempts) {
          return false; // All attempts failed
        }
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for 5 seconds
      }
    }
    return false;
  }

  async isInitialized() {
    const connection = await mysql.createConnection(this.getConnectionOptions("root"));
    try {
      const sql = 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?';
      const params = [this.databaseConfiguration.auth.database];
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(sql, params);
      const typedRows = rows as Array<mysql.RowDataPacket & { SCHEMA_NAME: string }>;
      return typedRows.length > 0;
    } finally {
      await connection.end();
    }
  }

  async containsData() {
    const connection = await mysql.createConnection(this.getConnectionOptions("root"));
    try {
      const sql = 'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?';
      const params = [this.databaseConfiguration.auth.database];
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(sql, params);
      const typedRows = rows as Array<mysql.RowDataPacket & { count: number }>;
      return typedRows[0]?.count > 0;
    } finally {
      await connection.end();
    }
  }

  async execute<T extends mysql.QueryResult>(
    database: DatabaseName,
    sql: string,
    params: Array<string | number> | null = null
  ): Promise<T> {
    const connection = await mysql.createConnection(this.getConnectionOptions(database));
    try {
      const [result] = await connection.execute<T>(sql, params ?? undefined);
      return result;
    } finally {
      await connection.end();
    }
  }
}

export default Database;
