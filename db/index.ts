import { drizzle } from "drizzle-orm/neon-http";
import { neon } from '@neondatabase/serverless';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize the SQL client with proper SSL configuration
const sql = neon(process.env.DATABASE_URL);

// Create database connection with schema
export const db = drizzle(sql, { schema });