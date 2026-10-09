import { Pool } from "pg";

declare global {
  var socContestPool: Pool | undefined;
}

const pool =
  global.socContestPool ??
  new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "soc_admin",
    password: process.env.POSTGRES_PASSWORD || "change_this_password",
    database: process.env.POSTGRES_DB || "soc_contest",
  });

if (process.env.NODE_ENV !== "production") {
  global.socContestPool = pool;
}

export default pool;
