
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

    // Get all directories in attached_assets
    const dirs = await fs.readdir(assetsPath);
    const excludedDirs = ['before_and_after', 'facebook_posts_image'];
    
    const categoryDirs = (await Promise.all(
      dirs.map(async dir => {
        const fullPath = path.join(assetsPath, dir);
        const stats = await fs.stat(fullPath).catch(() => null);
        return { dir, isDirectory: stats?.isDirectory() || false };
      })
    )).filter(({ dir, isDirectory }) => 
      isDirectory && !excludedDirs.includes(dir.toLowerCase())
    ).map(({ dir }) => dir);

    console.log('Found valid directories:', categoryDirs);

    // Insert categories
    for (const [index, dir] of categoryDirs.entries()) {
      const displayName = dir.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      await db.insert(categories).values({
        name: displayName,
        displayOrder: index + 1,
        description: `${displayName} Photography Sessions`
      });
    }

    // Process images in each category
    for (const dir of categoryDirs) {
      const dirPath = path.join(assetsPath, dir);
      const files = await fs.readdir(dirPath);
      const imageFiles = files
        .filter(file => /\.(jpg|jpeg)$/i.test(file) && !file.includes('thumb'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      console.log(`Found ${imageFiles.length} images in ${dir}`);

      const displayName = dir.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      for (const imageFile of imageFiles) {
        try {
          const id = parseInt(imageFile.match(/\d+/)?.[0] || '0');
          const imagePath = path.join(dirPath, imageFile);
          
          // Verify file exists and is readable
          await fs.access(imagePath, fs.constants.R_OK);
          
          await db.insert(photos).values({
            id,
            title: `${displayName} Portrait Session`,
            category: displayName,
            imageUrl: `/assets/${dir}/${imageFile}`,
            thumbnailUrl: `/assets/${dir}/${imageFile.replace(/\.(jpg|jpeg)$/i, '-thumb.jpeg')}`,
            displayOrder: id
          }).onConflictDoUpdate({
            target: [photos.id],
            set: { 
              title: `${displayName} Portrait Session`,
              category: displayName,
              imageUrl: `/assets/${dir}/${imageFile}`,
              thumbnailUrl: `/assets/${dir}/${imageFile.replace(/\.(jpg|jpeg)$/i, '-thumb.jpeg')}`,
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
    console.log(`Total photos in database: ${photoCount[0].count}`);
    console.log(`Total categories in database: ${categoryCount[0].count}`);

  } catch (error) {
    console.error('Error during image scan:', error);
    throw error;
  }
}
