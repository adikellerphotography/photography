
import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { sql } from 'drizzle-orm';
import { clearDatabase } from './clear-db';

async function validateImage(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    return stats.size > 0;
  } catch {
    return false;
  }
}

async function scanDirectory(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries
      .filter(entry => entry.isFile() && 
        /\.(jpg|jpeg)$/i.test(entry.name) && 
        !entry.name.includes('thumb'))
      .map(entry => entry.name);
    
    console.log(`Found ${files.length} files in ${dirPath}`);
    
    return files.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return [];
  }
}

export async function scanImages(targetPath?: string) {
  try {
    console.log('\n=== Starting Complete Image Scan ===');
    const assetsPath = targetPath || path.join(process.cwd(), 'attached_assets', 'galleries');
    console.log('Assets path:', assetsPath);

    // Verify directory exists
    try {
      await fs.access(assetsPath);
    } catch (error) {
      console.error('Gallery directory not found:', assetsPath);
      throw new Error('Gallery directory not found');
    }

    // Clear existing records
    await clearDatabase();

    // Get all directories
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const dirs = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    console.log('Found directories:', dirs);

    // Process each category directory
    for (const [index, dir] of dirs.entries()) {
      const displayName = dir.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Insert category
      await db.insert(categories).values({
        name: displayName,
        displayOrder: index + 1,
        description: `${displayName} Photography Sessions`
      });

      const dirPath = path.join(assetsPath, dir);
      const imageFiles = await scanDirectory(dirPath);
      console.log(`Processing ${imageFiles.length} images in ${dir}`);

      // Process images
      for (const [idx, imageFile] of imageFiles.entries()) {
        try {
          const id = parseInt(imageFile.match(/\d+/)?.[0] || String(idx + 1));
          const baseName = path.parse(imageFile).name;
          const ext = path.parse(imageFile).ext;

          const imageUrl = `/assets/galleries/${dir}/${imageFile}`;
          const thumbnailUrl = `/assets/galleries/${dir}/${baseName}-thumb${ext}`;
          
          // Validate image existence
          const fullImagePath = path.join(assetsPath, dir, imageFile);
          const isValid = await validateImage(fullImagePath);
          
          if (!isValid) {
            console.warn(`Invalid or missing image: ${fullImagePath}`);
            continue;
          }

          // Insert or update photo record
          await db.insert(photos).values({
            id,
            title: `${displayName} Portrait Session`,
            category: displayName,
            imageUrl,
            thumbnailUrl,
            displayOrder: id
          }).onConflictDoUpdate({
            target: [photos.id],
            set: {
              title: `${displayName} Portrait Session`,
              category: displayName,
              imageUrl,
              thumbnailUrl,
              displayOrder: id
            }
          });
        } catch (error) {
          console.error(`Error processing ${imageFile}:`, error);
        }
      }
    }

    const photoCount = await db.select({ count: sql`count(*)` }).from(photos);
    const categoryCount = await db.select({ count: sql`count(*)` }).from(categories);

    console.log('\n=== Scan Summary ===');
    console.log(`Total photos in database: ${photoCount[0].count}`);
    console.log(`Total categories in database: ${categoryCount[0].count}`);

  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}
