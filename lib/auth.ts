import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "betterAuth.db");
console.log("DB Path:", dbPath);

export const auth = betterAuth({
  database: new Database(dbPath),
  emailAndPassword: {
    enabled: true,
  },
});