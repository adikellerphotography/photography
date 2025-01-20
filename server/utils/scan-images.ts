
import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { sql } from 'drizzle-orm';

export async function scanImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const facebookPostsPath = path.join(assetsPath, 'facebook_posts_image');
    
    console.log('\n=== Starting Facebook Posts Image Scan ===');
    console.log('Assets path:', facebookPostsPath);

    // Clear existing records
    await db.delete(photos);
    await db.delete(categories);
    
    // Get all subdirectories in facebook_posts_image
    const dirs = await fs.readdir(facebookPostsPath);
    const categories_map: Record<string, string> = {
      'bat_mitsva': 'Bat Mitsva',
      'bar_mitsva': 'Bar Mitsva',
      'feminine': 'Women',
      'kids': 'Kids',
      'family': 'Family',
      'big_family': 'Big Family',
      'horses': 'Horses',
      'modeling': 'Modeling',
      'sweet_16': 'Sweet 16',
      'purim': 'Purim',
      'pregnancy': 'Pregnancy',
      'yoga': 'Yoga'
    };

    // Insert categories first
    for (const [index, dir] of dirs.entries()) {
      if ((await fs.stat(path.join(facebookPostsPath, dir))).isDirectory()) {
        const displayName = categories_map[dir] || dir.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        await db.insert(categories).values({
          name: displayName,
          displayOrder: index + 1,
          description: `${displayName} Photography Sessions`
        });
      }
    }

    async function processDirectory(dirPath: string, categoryName: string) {
      try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg)$/i.test(file)
        );

        console.log(`Found ${imageFiles.length} images in ${categoryName}`);

        for (const imageFile of imageFiles) {
          try {
            const id = parseInt(imageFile.split('.')[0]);
            const displayName = categories_map[categoryName] || categoryName.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            console.log(`Processing ${categoryName}/${imageFile}`);

            await db.insert(photos).values({
              id,
              title: `${displayName} Portrait Session`,
              category: displayName,
              imageUrl: `/assets/facebook_posts_image/${categoryName}/${imageFile}`,
              thumbnailUrl: `/assets/facebook_posts_image/${categoryName}/${imageFile}`,
              displayOrder: id
            }).onConflictDoUpdate({
              target: [photos.id],
              set: { 
                title: `${displayName} Portrait Session`,
                category: displayName,
                imageUrl: `/assets/facebook_posts_image/${categoryName}/${imageFile}`,
                thumbnailUrl: `/assets/facebook_posts_image/${categoryName}/${imageFile}`,
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
      const dirPath = path.join(facebookPostsPath, dir);
      if ((await fs.stat(dirPath)).isDirectory()) {
        console.log(`\nProcessing directory: ${dir}`);
        await processDirectory(dirPath, dir);
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
