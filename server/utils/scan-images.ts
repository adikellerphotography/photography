import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

export async function scanAndProcessImages(targetPath?: string) {
  try {
    const assetsPath = targetPath || path.join(process.cwd(), 'attached_assets');
    const excludedCategories = []; // Remove exclusions to allow all categories

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && 
      !entry.name.startsWith('.') &&
      !excludedCategories.includes(entry.name.replace(/_/g, ' ')) // Exclude specified categories
    );

    console.log(`\n=== Starting Image Scan ===`);
    console.log(`Found ${categoryDirs.length} category directories to process\n`);

    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath.replace(/_/g, ' '); // Convert underscores to spaces for DB
      const fullPath = path.join(assetsPath, categoryPath);

      console.log(`\n>>> Processing category: ${categoryName}`);
      console.log(`    Path: ${categoryPath}`);

      // Ensure category exists in database
      await db.insert(categories)
        .values({
          name: categoryName,
          displayOrder: 1,
          description: `${categoryName} photography collection`
        })
        .onConflictDoUpdate({
          target: categories.name,
          set: { description: `${categoryName} photography collection` }
        });

      // Get all images in this category
      const files = await fs.readdir(fullPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png)$/i.test(file) && 
        !file.includes('-thumb') // Exclude thumbnail files
      );

      console.log(`    Found ${imageFiles.length} images to process\n`);

      // Process each image
      let processedCount = 0;
      for (const imageFile of imageFiles) {
        processedCount++;
        try {
          // Check if image already exists in database
          const existingPhoto = await db.select()
            .from(photos)
            .where(eq(photos.imageUrl, imageFile));

          if (existingPhoto.length === 0) {
            const imagePath = path.join(fullPath, imageFile);
            let thumbnailUrl;

            try {
              thumbnailUrl = await generateThumbnail(imagePath);
              console.log(`Generated thumbnail for ${imageFile}: ${thumbnailUrl}`);
            } catch (error) {
              console.error(`Error generating thumbnail for ${imageFile}:`, error);
              thumbnailUrl = undefined;
            }

            // Insert new photo
            await db.insert(photos).values({
              title: path.basename(imageFile, path.extname(imageFile)),
              category: categoryName,
              imageUrl: imageFile,
              thumbnailUrl,
              displayOrder: 1
            });

            console.log(`    [${processedCount}/${imageFiles.length}] Added: ${imageFile}`);
          }
        } catch (error) {
          console.error(`    [${processedCount}/${imageFiles.length}] Error processing ${imageFile}:`, error);
        }
      }
      console.log(`\n    ✓ Completed ${categoryName}: ${processedCount} images processed\n`);
    }

    console.log('\n=== Image scanning and processing complete ===\n');
  } catch (error) {
    console.error('Error scanning images:', error);
    throw error;
  }
}