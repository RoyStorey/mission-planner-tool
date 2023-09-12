import { Pool } from "pg";

const postgreSQLClient = new Pool({
  user: process.env.PGUSER,
  host: '172.16.220.118',
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

export default postgreSQLClient;
