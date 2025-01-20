
import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { sql } from 'drizzle-orm';

export async function scanImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const mainDirs = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Women', 'Yoga'];

    console.log('\n=== Starting Image Scan ===');
    console.log('Assets path:', assetsPath);

    // Clear existing records
    await db.delete(photos);
    await db.delete(categories);
    
    // Insert categories first
    for (const [index, dir] of mainDirs.entries()) {
      const categoryName = dir.replace(/_/g, ' ');
      await db.insert(categories).values({
        name: categoryName,
        displayOrder: index + 1,
        description: `${categoryName} Photography Sessions`
      });
    }

    async function processDirectory(dirPath: string, categoryName: string) {
      try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter(file => 
          !file.includes('-thumb') && 
          file.match(/\.(jpg|jpeg)$/i)
        );

        console.log(`Found ${imageFiles.length} images in ${categoryName}`);

        for (const imageFile of imageFiles) {
          try {
            const id = parseInt(imageFile.split('.')[0]);
            console.log(`Processing ${categoryName}/${imageFile}`);

            await db.insert(photos).values({
              id,
              title: `${categoryName} Portrait Session`,
              category: categoryName.replace(/_/g, ' '),
              imageUrl: `/attached_assets/${categoryName}/${imageFile}`,
              thumbnailUrl: `/attached_assets/${categoryName}/${path.basename(imageFile, path.extname(imageFile))}-thumb${path.extname(imageFile)}`,
              displayOrder: id
            }).onConflictDoUpdate({
              target: [photos.id],
              set: { 
                title: `${categoryName} Portrait Session`,
                category: categoryName.replace(/_/g, ' '),
                imageUrl: `/attached_assets/${categoryName}/${imageFile}`,
                thumbnailUrl: `/attached_assets/${categoryName}/${path.basename(imageFile, path.extname(imageFile))}-thumb${path.extname(imageFile)}`,
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

    for (const dir of mainDirs) {
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
