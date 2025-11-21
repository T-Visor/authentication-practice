import Database from "better-sqlite3";

interface Session {
  id: string;
  secretHash: Uint8Array; // Byte array
  createdAt: Date;
}

interface SessionWithToken extends Session {
  token: string;
}

const DATABASE_NAME = "authentication.db";
const DATABASE_CONNECTION = new Database(DATABASE_NAME);
const SESSION_EXPIRATION_IN_SECONDS = 60 * 60 * 24; // 1 day

const main = () => {
  DATABASE_CONNECTION.exec(`
    CREATE TABLE IF NOT EXISTS session (
	    id TEXT NOT NULL PRIMARY KEY,
	    secret_hash BLOB NOT NULL, -- blob is a SQLite data type for raw binary
	    created_at INTEGER NOT NULL -- unix time (seconds)
    ) STRICT;
  `);

  DATABASE_CONNECTION.close();
};

const generateSecureRandomString = () => {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i] >> 3];
  }
  return id;
};

const createSession = async (): Promise<SessionWithToken> => {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + "." + secret;

  const session: SessionWithToken = {
    id,
    secretHash,
    createdAt: now,
    token
  };

  const sqlInsert = DATABASE_CONNECTION.prepare(`
    INSERT INTO session (id, secret_hash, created_at) 
    VALUES (?, ?, ?)`
  );

  sqlInsert.run(
    session.id,
    session.secretHash,
    Math.floor(session.createdAt.getTime() / 1000)
  );

  return session;
};

const hashSecret = async (secret: string): Promise<Uint8Array> => {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
};