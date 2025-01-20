import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

async function processDirectory(dirPath: string, categoryName: string) {
  try {
    // Ensure directory exists
    await fs.access(dirPath);

    // Get all images in this category
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file) && 
      !file.includes('-thumb') // Exclude thumbnail files
    );

    console.log(`Found ${imageFiles.length} images in ${categoryName}`);

    // Process each image
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

        // Insert or update in database
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

async function processFacebookPosts(basePath: string) {
  const entries = await fs.readdir(basePath, { withFileTypes: true });
  const categoryDirs = entries.filter(entry => entry.isDirectory());

  console.log(`Found ${categoryDirs.length} Facebook post categories`);

  for (const dir of categoryDirs) {
    const categoryPath = dir.name;
    const fullPath = path.join(basePath, categoryPath);

    console.log(`Processing category: ${categoryPath}`);

    const files = await fs.readdir(fullPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    for (const imageFile of imageFiles) {
      try {
        const imagePath = path.join(fullPath, imageFile);
        let thumbnailUrl;

        try {
          thumbnailUrl = await generateThumbnail(imagePath);
          console.log(`Generated thumbnail for ${imageFile}`);
        } catch (error) {
          console.error(`Error generating thumbnail for ${imageFile}:`, error);
          continue;
        }

        // Insert or update in database
        const relativePath = path.join('facebook_posts_image', categoryPath.replace(/\s+/g, '_'), imageFile);
        await db.insert(photos).values({
          title: path.basename(imageFile, path.extname(imageFile)),
          category: categoryPath.replace(/_/g, ' '),
          imageUrl: `/assets/${relativePath}`,
          thumbnailUrl: thumbnailUrl ? `/assets/${thumbnailUrl}` : null,
          displayOrder: 1
        }).onConflictDoUpdate({
          target: [photos.imageUrl],
          set: { 
            thumbnailUrl: thumbnailUrl ? `/assets/${thumbnailUrl}` : null,
            imageUrl: `/assets/${relativePath}`
          }
        });

        console.log(`Processed: ${imageFile}`);
      } catch (error) {
        console.error(`Error processing ${imageFile}:`, error);
      }
    }
  }
}

export async function scanAndProcessImages(targetPath?: string) {
  try {
    const assetsPath = targetPath || path.join(process.cwd(), 'attached_assets');
    const mainDirs = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Women', 'Yoga'];
    
    console.log('Scanning specified directories...');
    for (const dir of mainDirs) {
      const dirPath = path.join(process.cwd(), 'attached_assets', dir);
      console.log(`Processing directory: ${dir}`);
      await processDirectory(dirPath, dir);
    }
    return;

    // If targeting facebook posts, adjust the path
    if (process.argv.includes('--scan-facebook-posts')) {
      console.log('Scanning Facebook posts images...');
      const facebookPostsPath = path.join(process.cwd(), 'attached_assets', 'facebook_posts_image');
      await processFacebookPosts(facebookPostsPath);
      return;
    }

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && 
      !entry.name.startsWith('.')
    );

    console.log(`\n=== Starting Image Scan ===`);
    console.log(`Found ${categoryDirs.length} category directories to process\n`);

    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath.replace(/_/g, ' '); // Convert underscores to spaces for DB
      const fullPath = path.join(assetsPath, categoryPath);

      console.log(`\n>>> Processing category: ${categoryName}`);
      console.log(`    Path: ${categoryPath}`);

      await processDirectory(fullPath, categoryName);
    }

    console.log('\n=== Image scanning and processing complete ===\n');
  } catch (error) {
    console.error('Error scanning images:', error);
    throw error;
  }
}