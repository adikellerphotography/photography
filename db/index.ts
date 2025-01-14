import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configure postgres with keep-alive settings and proper error handling
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
});

// Create drizzle database instance with error handling
export const db = drizzle(client, { schema });

// Initialize database and schema
export async function initialize() {
  try {
    // Test database connection
    console.log("Testing database connection...");
    await client`SELECT 1`;
    console.log("Database connection successful");

    // Push schema changes
    try {
      console.log("Updating database schema...");
      const { execSync } = await import('child_process');
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log("Database schema updated successfully");

      // Log existing tables
      const tables = await client`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `;
      console.log("Database tables:", tables.map(t => t.tablename).join(', '));

      return true;
    } catch (err) {
      console.error("Failed to update database schema:", err);
      throw err;
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
}

export default db;