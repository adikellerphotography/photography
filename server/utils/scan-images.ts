import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

function formatTitle(fileName: string, category: string): string {
  // Remove file extension and 'Large' suffix
  let title = fileName.replace(/\.(jpe?g|png)$/i, '').replace(/\s*Large$/i, '');

  // Remove any -Edit or -Edit-Edit suffixes
  title = title.replace(/-Edit(-Edit)?/g, '');

  // Remove any numerical prefixes like "IMG_1234" or "M68A"
  title = title.replace(/^(IMG_|M68A)\d+(-|$)/, '');

  // Replace underscores and dashes with spaces
  title = title.replace(/[_-]/g, ' ');

  // Remove any double spaces
  title = title.replace(/\s+/g, ' ').trim();

  // Add category-specific prefixes and formatting
  switch (category) {
    case 'Bat_Mitsva':
      return `Bat Mitzvah Portrait Session${title ? ': ' + title : ''}`;
    case 'Family':
      return `Family Portrait${title ? ': ' + title : ''}`;
    case 'Kids':
      return `Children's Portrait${title ? ': ' + title : ''}`;
    case 'Women':
      return `Women's Portrait${title ? ': ' + title : ''}`;
    case 'Modeling':
      return `Model Portfolio${title ? ': ' + title : ''}`;
    case 'Yoga':
      return `Yoga Photography${title ? ': ' + title : ''}`;
    default:
      return title || category;
  }
}

export async function scanAndProcessImages() {
  try {
    console.log('Starting image scan process...');
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const categoriesPath = path.join(assetsPath, 'categories');

    // Clean up existing data
    await db.delete(photos);
    await db.delete(categories);
    console.log('Cleaned up existing database records');

    // Get all directories in the categories folder
    const entries = await fs.readdir(categoriesPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    console.log(`Found ${categoryDirs.length} category directories in categories folder`);

    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath;  // Keep original folder name as category name
      const fullPath = path.join(categoriesPath, categoryPath);

      console.log(`Processing category: ${categoryName} from path: ${fullPath}`);

      // Ensure category exists in database
      await db.insert(categories)
        .values({
          name: categoryName,
          displayOrder: 1,
          description: `${categoryName.replace(/_/g, ' ')} photography collection`
        })
        .onConflictDoUpdate({
          target: categories.name,
          set: { description: `${categoryName.replace(/_/g, ' ')} photography collection` }
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
          const imagePath = path.join(fullPath, imageFile);
          let thumbnailUrl;

          try {
            thumbnailUrl = await generateThumbnail(imagePath);
            console.log(`Generated thumbnail for ${imageFile}: ${thumbnailUrl}`);
          } catch (error) {
            console.error(`Error generating thumbnail for ${imageFile}:`, error);
            thumbnailUrl = undefined;
          }

          // Generate a meaningful title for the photo
          const title = formatTitle(imageFile, categoryName);

          // Insert new photo
          await db.insert(photos).values({
            title,
            category: categoryName,
            imageUrl: imageFile,
            thumbnailUrl: thumbnailUrl ? path.basename(thumbnailUrl) : null,
            displayOrder: 1
          });

          console.log(`Added new photo: ${imageFile} in category ${categoryName} with title: ${title}`);
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