import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

const databasePath = "./betterAuth.db";

export const auth = betterAuth({
  database: new Database(databasePath),
  emailAndPassword: {
    enabled: true,
  },
});