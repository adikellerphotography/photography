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
  switch (category.toLowerCase()) {
    case 'kids':
      return `Children's Portrait${title ? ': ' + title : ''}`;
    case 'family':
      return `Family Portrait${title ? ': ' + title : ''}`;
    case 'bat mitsva':
      return `Bat Mitzvah Portrait Session${title ? ': ' + title : ''}`;
    default:
      return title || category;
  }
}

export async function scanAndProcessImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    console.log('Starting image scan from:', assetsPath);

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    console.log(`Found ${categoryDirs.length} category directories`);

    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath.replace(/_/g, ' '); // Convert underscores to spaces for DB
      const fullPath = path.join(assetsPath, categoryPath);

      console.log(`Processing category: ${categoryName} from path: ${categoryPath}`);

      // Ensure category exists in database
      const existingCategory = await db.select().from(categories).where(eq(categories.name, categoryName));

      if (existingCategory.length === 0) {
        await db.insert(categories).values({
          name: categoryName,
          description: `${categoryName} photography collection`
        });
      }

      // Get all images in this category
      const files = await fs.readdir(fullPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png)$/i.test(file) && 
        !file.includes('-thumb') && // Exclude thumbnail files
        file.includes('Large') // Only include full-size images
      );

      console.log(`Found ${imageFiles.length} images in ${categoryName}`);

      // Process each image
      for (const imageFile of imageFiles) {
        try {
          console.log(`Processing image: ${imageFile} in category ${categoryName}`);

          // Generate a meaningful title for the photo
          const title = formatTitle(imageFile, categoryName);

          // Check if image already exists in database
          const existingPhotos = await db.select()
            .from(photos)
            .where(eq(photos.imageUrl, imageFile));

          if (existingPhotos.length === 0) {
            const imagePath = path.join(fullPath, imageFile);
            console.log(`Generating thumbnail for: ${imagePath}`);

            let thumbnailUrl;
            try {
              thumbnailUrl = await generateThumbnail(imagePath);
              console.log(`Generated thumbnail: ${thumbnailUrl}`);
            } catch (error) {
              console.error(`Error generating thumbnail for ${imageFile}:`, error);
              thumbnailUrl = undefined;
            }

            // Insert new photo
            await db.insert(photos).values({
              title,
              category: categoryName,
              imageUrl: imageFile,
              thumbnailUrl,
              description: `${categoryName} photography - ${title}`
            });

            console.log(`Added new photo: ${imageFile} in category ${categoryName} with title: ${title}`);
          } else {
            console.log(`Photo ${imageFile} already exists in database`);
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