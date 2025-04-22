import DatabaseConfiguration from "../types/DatabaseConfiguration";

const mysql = require('mysql2/promise');

class Database {
  private databaseConfiguration: DatabaseConfiguration;

  constructor(databaseConfiguration: DatabaseConfiguration) {
    this.databaseConfiguration = databaseConfiguration;
  }

  async checkConnection(database: string, maxAttempts: number = 12, delay: number = 5000, attemptFailed: Function | null = null) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const config = this.databaseConfiguration as Record<string, any>;
        const connection = await mysql.createConnection(config[database]);
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
  }

  async isInitialized() {
    const config = this.databaseConfiguration as Record<string, any>;
    const connection = await mysql.createConnection(config['root']);
    try {
      const sql = 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?';
      const params = [config['auth'].database];
      const [rows] = await connection.execute(sql, params);
      return rows.length > 0;
    } finally {
      await connection.end();
    }
  }

  async containsData() {
    const config = this.databaseConfiguration as Record<string, any>;
    const connection = await mysql.createConnection(config['root']);
    try {
      const sql = 'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?';
      const params = [config['auth'].database];
      const [rows] = await connection.execute(sql, params);
      return rows[0].count > 0;
    } finally {
      await connection.end();
    }
  }

  async execute(database: string, sql: string, params: Array<string | number> | null = null) {
    const config = this.databaseConfiguration as Record<string, any>;
    const connection = await mysql.createConnection(config[database]);
    try {
      const [result] = await connection.execute(sql, params);
      return result;
    } finally {
      await connection.end();
    }
  }
}

export default Database;