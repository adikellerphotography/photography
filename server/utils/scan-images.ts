import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { sql } from 'drizzle-orm';

export async function scanImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    console.log('\n=== Starting Image Scan ===');
    console.log('Assets path:', assetsPath);

    // Clear existing records
    await db.delete(photos);
    await db.delete(categories);

    // Get all directories except excluded ones
    const excludedDirs = ['before_and_after', 'facebook_posts_image'];
    const dirs = (await fs.readdir(assetsPath, { withFileTypes: true }))
      .filter(dirent => 
        dirent.isDirectory() && 
        !excludedDirs.includes(dirent.name) &&
        !dirent.name.startsWith('.')
      )
      .map(dirent => dirent.name);

    console.log('Found directories:', dirs);

    // Insert categories first
    for (const [index, dir] of dirs.entries()) {
      const displayName = dir.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      await db.insert(categories).values({
        name: displayName,
        displayOrder: index + 1,
        description: `${displayName} Photography Sessions`
      });
    }

    async function processDirectory(dirPath: string, categoryName: string) {
      try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg)$/i.test(file) && !file.includes('-thumb')
        ).sort((a, b) => {
          const numA = parseInt(a.split('.')[0]);
          const numB = parseInt(b.split('.')[0]);
          return numA - numB;
        });

        console.log(`Found ${imageFiles.length} images in ${categoryName}`);

        for (const imageFile of imageFiles) {
          try {
            const id = parseInt(imageFile.split('.')[0]);
            const displayName = categoryName.split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            await db.insert(photos).values({
              id,
              title: `${displayName} Portrait Session`,
              category: displayName,
              imageUrl: `/assets/${categoryName}/${imageFile}`,
              thumbnailUrl: `/assets/${categoryName}/${imageFile.replace('.jpeg', '-thumb.jpeg')}`,
              displayOrder: id
            }).onConflictDoUpdate({
              target: [photos.id],
              set: { 
                title: `${displayName} Portrait Session`,
                category: displayName,
                imageUrl: `/assets/${categoryName}/${imageFile}`,
                thumbnailUrl: `/assets/${categoryName}/${imageFile.replace('.jpeg', '-thumb.jpeg')}`,
                displayOrder: id
              }
            });
          } catch (error) {
            console.error(`Error processing ${imageFile}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing directory ${categoryName}:`, error);
      }
    }

    for (const dir of dirs) {
      const dirPath = path.join(assetsPath, dir);
      console.log(`\nProcessing directory: ${dir}`);
      await processDirectory(dirPath, dir);
    }

    const photoCount = await db.select({ count: sql`count(*)` }).from(photos);
    const categoryCount = await db.select({ count: sql`count(*)` }).from(categories);
    console.log(`Total photos in database: ${photoCount[0].count}`);
    console.log(`Total categories in database: ${categoryCount[0].count}`);

  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}