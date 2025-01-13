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

  // Remove before/after numbers from filenames
  title = title.replace(/(\s*[_-]?\d+\s*)?(before|after)?$/i, '');

  // Replace underscores and dashes with spaces
  title = title.replace(/[_-]/g, ' ');

  // Remove any double spaces
  title = title.replace(/\s+/g, ' ').trim();

  // Add category-specific prefixes and formatting
  switch (category) {
    case 'Bat Mitsva':
      return `Bat Mitzvah Portrait Session${title ? ': ' + title : ''}`;
    case 'Family':
      return `Family Portrait${title ? ': ' + title : ''}`;
    case 'Kids':
      return `Children's Portrait${title ? ': ' + title : ''}`;
    case 'Events':
      return `Event Photography${title ? ': ' + title : ''}`;
    case 'Portraits':
      return `Portrait Session${title ? ': ' + title : ''}`;
    case 'Nature':
      return `Nature Photography${title ? ': ' + title : ''}`;
    case 'Wedding':
      return `Wedding Photography${title ? ': ' + title : ''}`;
    case 'Modeling':
      return `Model Portfolio${title ? ': ' + title : ''}`;
    case 'Women':
      return `Women's Portrait${title ? ': ' + title : ''}`;
    case 'Yoga':
      return `Yoga Photography${title ? ': ' + title : ''}`;
    case 'Before And After':
      return `Before & After${title ? ': ' + title : ''}`;
    default:
      return title || category;
  }
}

export async function scanAndProcessImages() {
  try {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    const categoriesPath = path.join(assetsPath, 'categories');

    // Get all directories (categories)
    const entries = await fs.readdir(categoriesPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    console.log(`Found ${categoryDirs.length} category directories in categories folder`);

    // Clear existing photos and categories
    await db.delete(photos);
    await db.delete(categories);

    let displayOrder = 1;
    for (const dir of categoryDirs) {
      const categoryPath = dir.name;
      const categoryName = categoryPath.replace(/_/g, ' '); // Convert underscores to spaces for DB
      const fullPath = path.join(categoriesPath, categoryPath);

      console.log(`Processing category: ${categoryName} from path: ${categoryPath}`);

      // Insert category
      await db.insert(categories).values({
        name: categoryName,
        displayOrder: displayOrder++,
        description: `${categoryName} photography collection`
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

          // Insert new photo with path that includes 'categories' subfolder
          await db.insert(photos).values({
            title,
            category: categoryName,
            imageUrl: path.join('categories', categoryPath, imageFile),
            thumbnailUrl: thumbnailUrl ? path.join('categories', categoryPath, thumbnailUrl) : undefined,
            displayOrder: displayOrder++
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