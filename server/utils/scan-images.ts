import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

export async function scanAndProcessImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const excludedCategories = ['Kids']; // Add categories to exclude from scanning

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && 
      !entry.name.startsWith('.') &&
      !excludedCategories.includes(entry.name.replace(/_/g, ' ')) // Exclude specified categories
    );

    console.log(`Found ${categoryDirs.length} category directories`);

    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath.replace(/_/g, ' '); // Convert underscores to spaces for DB
      const fullPath = path.join(assetsPath, categoryPath);

      console.log(`Processing category: ${categoryName} from path: ${categoryPath}`);

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

      console.log(`Found ${imageFiles.length} images in ${categoryName}`);

      // Process each image
      for (const imageFile of imageFiles) {
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

            console.log(`Added new photo: ${imageFile} in category ${categoryName}`);
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