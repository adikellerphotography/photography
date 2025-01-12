import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

export async function scanAndProcessImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    console.log(`Found ${categoryDirs.length} category directories`);

    for (const dir of categoryDirs) {
      const categoryName = dir.name;
      const categoryPath = path.join(assetsPath, categoryName);

      // Ensure category exists in database
      await db.insert(categories)
        .values({
          name: categoryName.replace(/_/g, ' '), // Convert underscores back to spaces
          displayOrder: 1, // You may want to adjust this
          description: `${categoryName.replace(/_/g, ' ')} photography collection`
        })
        .onConflictDoUpdate({
          target: categories.name,
          set: { description: `${categoryName.replace(/_/g, ' ')} photography collection` }
        });

      // Get all images in this category
      const files = await fs.readdir(categoryPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png)$/i.test(file) && 
        !file.includes('-thumb') // Exclude thumbnail files
      );

      console.log(`Processing ${imageFiles.length} images in ${categoryName}`);

      // Process each image
      for (const imageFile of imageFiles) {
        try {
          // Check if image already exists in database
          const existingPhoto = await db.select()
            .from(photos)
            .where(eq(photos.imageUrl, imageFile));

          if (existingPhoto.length === 0) {
            const imagePath = path.join(categoryPath, imageFile);
            let thumbnailUrl;

            try {
              thumbnailUrl = await generateThumbnail(imagePath);
            } catch (error) {
              console.error(`Error generating thumbnail for ${imageFile}:`, error);
              thumbnailUrl = undefined;
            }

            // Insert new photo
            await db.insert(photos).values({
              title: path.basename(imageFile, path.extname(imageFile)),
              category: categoryName.replace(/_/g, ' '),
              imageUrl: imageFile,
              thumbnailUrl,
              displayOrder: 1 // You may want to adjust this
            });

            console.log(`Added new photo: ${imageFile}`);
          }
        } catch (error) {
          console.error(`Error processing image ${imageFile}:`, error);
        }
      }
    }

    console.log('Image scanning and processing complete');
  } catch (error) {
    console.error('Error scanning images:', error);
    throw error;
  }
}