
import { db } from "@db";
import { photos, categories } from "@db/schema";

export async function clearDatabase() {
  try {
    await db.delete(photos);
    await db.delete(categories);
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}
