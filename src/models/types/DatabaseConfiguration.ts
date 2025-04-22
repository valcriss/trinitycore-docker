type DatabaseConfiguration =
  {
    root: {
      host: string | null;
      port: string | null;
      user: string | null;
      password: string | null
    },
    auth: {
      host: string | null;
      port: string | null;
      user: string | null;
      password: string | null;
      database: string | null;
    },
    world: {
      host: string | null;
      port: string | null;
      user: string | null;
      password: string | null;
      database: string | null;
    },
    characters: {
      host: string | null;
      port: string | null;
      user: string | null;
      password: string | null;
      database: string | null;
    },
    hotfixes: {
      host: string | null;
      port: string | null;
      user: string | null;
      password: string | null;
      database: string | null;
    }
  }

export default DatabaseConfiguration;