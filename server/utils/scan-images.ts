import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { sql } from 'drizzle-orm';

async function scanDirectory(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && /\.(jpg|jpeg)$/i.test(entry.name))
    .map(entry => entry.name);
  return files.sort();
}

export async function scanGalleries(targetPath?: string) { // Renamed for clarity
  try {
    const assetsPath = targetPath || path.join(process.cwd(), 'attached_assets', 'galleries');
    console.log('\n=== Starting Image Scan ===');
    console.log('Assets path:', assetsPath);

    // Clear existing records
    await db.delete(photos);
    await db.delete(categories);

    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const dirs = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    console.log('Found directories:', dirs);

    for (const [categoryIndex, dir] of dirs.entries()) {
      const displayName = dir.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      await db.insert(categories).values({
        name: displayName,
        displayOrder: categoryIndex + 1,
        description: `${displayName} Photography Sessions`
      });

      const dirPath = path.join(assetsPath, dir);
      const imageFiles = await scanDirectory(dirPath);
      console.log(`Processing ${imageFiles.length} images in ${dir}`);

      for (const [imageIndex, imageFile] of imageFiles.entries()) {
        try {
          const baseName = path.parse(imageFile).name;
          const ext = path.parse(imageFile).ext.toLowerCase();
          const id = parseInt(baseName) || imageIndex + 1;
          
          // Check for thumbnail
          const thumbName = `${baseName}-thumb${ext}`;
          const thumbExists = imageFiles.includes(thumbName);
          
          const imageUrl = `/attached_assets/galleries/${dir}/${imageFile}`;
          const thumbnailUrl = thumbExists ? `/attached_assets/galleries/${dir}/${thumbName}` : imageUrl;
          
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

    console.log('=== Scan Complete ===');
    console.log(`Total photos in database: ${photoCount[0].count}`);
    console.log(`Total categories in database: ${categoryCount[0].count}`);
  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}

export async function scanFacebookPostsImages() { // New function for Facebook posts
  try {
    const fbPostsPath = path.join(process.cwd(), 'attached_assets', 'facebook_posts_image');
    console.log('\n=== Starting Facebook Posts Image Scan ===');
    console.log('Assets path:', fbPostsPath);

    const entries = await fs.readdir(fbPostsPath, { withFileTypes: true });
    const dirs = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    console.log('Found directories:', dirs);

    for (const dir of dirs) {
      const dirPath = path.join(fbPostsPath, dir);
      const imageFiles = await scanDirectory(dirPath);

      // Create thumbnails directory if it doesn't exist
      const thumbnailsDir = path.join(dirPath, 'thumbnails');
      try {
        await fs.mkdir(thumbnailsDir, { recursive: true });
      } catch (error) {
        console.log('Thumbnails directory already exists or error creating it:', error);
      }

      // Process each image
      for (const imageFile of imageFiles) {
        try {
          const baseName = path.parse(imageFile).name;
          const ext = path.parse(imageFile).ext.toLowerCase();

          // Copy original file as numbered sequence.  This section seems redundant.
          const originalPath = path.join(dirPath, imageFile);
          const newPath = path.join(dirPath, `${baseName}${ext}`);

          if (originalPath !== newPath) {
            await fs.copyFile(originalPath, newPath);
          }

          // Create thumbnail if it doesn't exist
          const thumbPath = path.join(thumbnailsDir, `${baseName}${ext}`);
          try {
            await fs.copyFile(originalPath, thumbPath);
          } catch (error) {
            console.error(`Error creating thumbnail for ${imageFile}:`, error);
          }
        } catch (error) {
          console.error(`Error processing ${imageFile}:`, error);
        }
      }

      console.log(`Processed ${imageFiles.length} images in ${dir}`);
    }

    console.log('=== Scan Complete ===');
  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}