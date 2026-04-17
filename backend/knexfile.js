/** @type { import('knex').Knex.Config } */
const development = {
  client: "better-sqlite3",
  connection: { filename: "./data/dashrunner.sqlite" },
  useNullAsDefault: true,
  migrations: { directory: "./migrations" },
};

export default {
  development,
  production: {
    client: "better-sqlite3",
    connection: {
      filename: process.env.DASHRUNNER_DATABASE_FILE || "./data/dashrunner.sqlite",
    },
    useNullAsDefault: true,
    migrations: { directory: "./migrations" },
  },
};
