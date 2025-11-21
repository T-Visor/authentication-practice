import Database from "better-sqlite3";
import type { Database as SQLiteDatabase } from "better-sqlite3";

interface Session {
  id: string;
  secretHash: Uint8Array; // Byte array
  createdAt: Date;
}

interface SessionWithToken extends Session {
  token: string;
}

interface SessionRowFromDatabase {
  id: string;
  secret_hash: Uint8Array;
  created_at: number;
}

const DATABASE_NAME = "authentication.db";
const DATABASE_INSTANCE: SQLiteDatabase = new Database(DATABASE_NAME);
const SESSION_EXPIRATION_IN_SECONDS = 60 * 60 * 24; // 1 day

const main = () => {
  DATABASE_INSTANCE.exec(`
    CREATE TABLE IF NOT EXISTS session (
	    id TEXT NOT NULL PRIMARY KEY,
	    secret_hash BLOB NOT NULL, -- blob is a SQLite data type for raw binary
	    created_at INTEGER NOT NULL -- unix time (seconds)
    ) STRICT;
  `);

  DATABASE_INSTANCE.close();
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

const createSession = async (
  databaseConnection: SQLiteDatabase
): Promise<SessionWithToken> => {
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

  const sqlInsert = databaseConnection.prepare(`
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

const validateSessionToken = async (
  databaseConnection: SQLiteDatabase,
  token: string
): Promise<Session | null> => {

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return null;
  }

  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = getSession(databaseConnection, sessionId);
  if (!session) {
    return null;
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return null;
  }

  return session;
};

const getSession = (
  databaseConnection: SQLiteDatabase, 
  sessionId: string
): Session | null => {
	const now = new Date();

  const row = databaseConnection.prepare(`
		SELECT id, secret_hash, created_at 
    FROM session 
    WHERE id = ?
  `).get(sessionId) as SessionRowFromDatabase | undefined;

	if (!row) {
		return null;
	}

	const session: Session = {
		id: row.id,
		secretHash: row.secret_hash,
		createdAt: new Date(row.created_at * 1000)
	};

	// Check expiration
	if (now.getTime() - session.createdAt.getTime() >= SESSION_EXPIRATION_IN_SECONDS * 1000) {
		deleteSession(databaseConnection, sessionId);
		return null;
	}

	return session;
};

const deleteSession = (
  databaseConnection: SQLiteDatabase, 
  sessionId: string
): void => {
  databaseConnection.prepare("DELETE FROM session WHERE id = ?").run(sessionId);	
};

const hashSecret = async (
  secret: string
): Promise<Uint8Array> => {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
};

const constantTimeEqual = (
  first: Uint8Array, 
  second: Uint8Array
): boolean => {
  // If lengths differ, arrays cannot be equal.
	if (first.byteLength !== second.byteLength) {
		return false;
	}

  // Accumulates XOR results of all byte comparisons.
  // If any byte differs, it becomes non-zero.
	let differenceMask = 0;

	for (let i = 0; i < first.byteLength; i++) {
		differenceMask |= first[i] ^ second[i];
	}

  // Arrays are equal only if diff remains zero.
	return differenceMask === 0; 
};

const encodeSessionPublicJSON = (session: Session): string => {
	// Omit Session.secretHash
	const json = JSON.stringify({
		id: session.id,
		created_at: Math.floor(session.createdAt.getTime() / 1000)
	});
	return json;
};