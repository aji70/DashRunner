import knex from "knex";
import knexfile from "../knexfile.js";

const env = process.env.NODE_ENV || "development";
const config = knexfile[env] || knexfile.development;

export default knex(config);
