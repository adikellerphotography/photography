import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
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

// Test database connection with a simple query
const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

testConnection();