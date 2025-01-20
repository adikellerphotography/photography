
import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos } from "@db/schema";
import { sql } from 'drizzle-orm';
import { generateThumbnail } from './image';

export async function scanImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const mainDirs = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Women', 'Yoga'];

    console.log('\n=== Starting Image Scan ===');
    console.log('Assets path:', assetsPath);

    // Clear existing records
    await db.delete(photos);
    
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
            const imagePath = path.join(dirPath, imageFile);
            
            console.log(`Processing ${categoryName}/${imageFile}`);

            await db.insert(photos).values({
              id,
              title: `${categoryName} Portrait Session`,
              category: categoryName,
              imageUrl: `/attached_assets/${categoryName}/${imageFile}`,
              thumbnailUrl: `/attached_assets/${categoryName}/${path.basename(imageFile, path.extname(imageFile))}-thumb${path.extname(imageFile)}`,
              displayOrder: id
            }).onConflictDoUpdate({
              target: [photos.id],
              set: { 
                title: `${categoryName} Portrait Session`,
                category: categoryName,
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

    const count = await db.select({ count: sql`count(*)` }).from(photos);
    console.log(`Total photos in database after scan: ${count[0].count}`);

  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}
