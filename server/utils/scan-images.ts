
import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos } from "@db/schema";
import { generateThumbnail } from "./image";

async function processDirectory(dirPath: string, categoryName: string) {
  try {
    await fs.access(dirPath);
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file) && 
      !file.includes('-thumb')
    );

    console.log(`Found ${imageFiles.length} images in ${categoryName}`);

    for (const imageFile of imageFiles) {
      const imagePath = path.join(dirPath, imageFile);
      const id = parseInt(path.basename(imageFile, path.extname(imageFile)));

      if (isNaN(id)) {
        console.warn(`Skipping file with invalid ID format: ${imageFile}`);
        continue;
      }

      try {
        let thumbnailPath = path.join(dirPath, `${path.basename(imageFile, path.extname(imageFile))}-thumb${path.extname(imageFile)}`);
        console.log(`Processing image: ${imageFile} (ID: ${id})`);

        if (!await fs.access(thumbnailPath).then(() => true).catch(() => false)) {
          console.log(`Generating thumbnail for: ${imageFile}`);
          await generateThumbnail(imagePath);
        }

        const imageRecord = {
          id,
          title: `${categoryName} Portrait Session`,
          category: categoryName,
          imageUrl: `/attached_assets/${categoryName}/${imageFile}`,
          thumbnailUrl: `/attached_assets/${categoryName}/${path.basename(imageFile, path.extname(imageFile))}-thumb${path.extname(imageFile)}`,
          displayOrder: id
        };

        await db.insert(photos).values(imageRecord).onConflictDoUpdate({
          target: [photos.id],
          set: imageRecord
        });

        console.log(`Successfully processed: ${imageFile}`);
      } catch (error) {
        console.error(`Error processing ${imageFile}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${categoryName}:`, error);
  }
}

export async function scanAndProcessImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const mainDirs = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Women', 'Yoga'];

    console.log('\n=== Starting Image Scan ===');
    console.log('Assets path:', assetsPath);

    // Clear existing records
    await db.delete(photos);
    console.log('Cleared existing photo records');

    for (const dir of mainDirs) {
      const dirPath = path.join(assetsPath, dir);
      console.log(`\nProcessing directory: ${dir} (${dirPath})`);
      await processDirectory(dirPath, dir);
    }

    // Verify records were inserted
    const count = await db.select({ count: sql`count(*)` }).from(photos);
    console.log(`Total photos in database after scan: ${count[0].count}`);

    console.log('\n=== Image scanning and processing complete ===\n');
  } catch (error) {
    console.error('Error scanning images:', error);
    throw error;
  }
}
