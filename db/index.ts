import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configure postgres with keep-alive settings and proper error handling
const client = postgres(process.env.DATABASE_URL, {
  max: 1, // Reduce max connections to prevent connection pool issues
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  connect_timeout: 10,
});

// Create drizzle database instance with error handling
export const db = drizzle(client, { schema });

// Test database connection and initialize schema
const initializeDatabase = async () => {
  try {
    // Test the connection
    await client`SELECT 1`;
    console.log("Database connection successful");

    // Push the schema changes
    const { execSync } = await import('child_process');
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log("Database schema updated successfully");

      // Verify tables exist
      const tableCount = await client`
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log(`Found ${tableCount[0].count} tables in database`);

    } catch (err) {
      console.error("Failed to update database schema:", err);
      // Continue execution even if schema push fails
    }
  } catch (err) {
    console.error("Database connection error:", err);
    throw err; // Let the application handle the error
  }
};

// Initialize the database
export const initialize = () => initializeDatabase().catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

export default db;