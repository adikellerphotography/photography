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
      try {
        const imagePath = path.join(dirPath, imageFile);
        let thumbnailUrl;

        try {
          thumbnailUrl = await generateThumbnail(imagePath);
          console.log(`Generated thumbnail for ${imageFile}`);
        } catch (error) {
          console.error(`Error generating thumbnail for ${imageFile}:`, error);
          continue;
        }

        await db.insert(photos).values({
          title: path.basename(imageFile, path.extname(imageFile)),
          category: categoryName.replace(/_/g, ' '),
          imageUrl: `/assets/${path.join(categoryName.replace(/\s+/g, '_'), imageFile)}`,
          thumbnailUrl: thumbnailUrl ? `/assets/${thumbnailUrl}` : null,
          displayOrder: 1
        }).onConflictDoUpdate({
          target: [photos.imageUrl],
          set: { 
            thumbnailUrl: thumbnailUrl ? `/assets/${thumbnailUrl}` : null,
            imageUrl: `/assets/${path.join(categoryName.replace(/\s+/g, '_'), imageFile)}`
          }
        });

        console.log(`Processed: ${imageFile}`);
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
    const mainDirs = ['Bat_Mitsva', 'Family', 'Horses', 'kids', 'Modeling', 'Women', 'Yoga', 'facebook_posts_image'];

    console.log('\n=== Starting Image Scan ===\n');

    // Process main directories
    for (const dir of mainDirs) {
      const dirPath = path.join(assetsPath, dir);
      console.log(`\nProcessing directory: ${dir}`);

      if (dir === 'facebook_posts_image') {
        // Handle facebook_posts_image subdirectories
        const subDirs = await fs.readdir(dirPath);
        for (const subDir of subDirs) {
          const subDirPath = path.join(dirPath, subDir);
          const isDirectory = (await fs.stat(subDirPath)).isDirectory();
          if (isDirectory) {
            console.log(`Processing facebook subdirectory: ${subDir}`);
            await processDirectory(subDirPath, `facebook_${subDir}`);
          }
        }
      } else {
        await processDirectory(dirPath, dir);
      }
    }

    console.log('\n=== Image scanning and processing complete ===\n');
  } catch (error) {
    console.error('Error scanning images:', error);
    throw error;
  }
}