import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { generateThumbnail } from "./image";
import { eq } from 'drizzle-orm';

function isMainImage(fileName: string): boolean {
  const normalizedName = fileName.toLowerCase();
  return normalizedName === 'main.jpg' || normalizedName === 'main.jpeg';
}

function formatTitle(fileName: string, category: string): string {
  // Skip formatting for main images as they're special cases
  if (isMainImage(fileName)) {
    return `${category} - Featured Image`;
  }

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
    default:
      return title || category;
  }
}

export async function scanAndProcessImages() {
  try {
    console.log('Starting image scan process...');
    const assetsPath = path.join(process.cwd(), 'attached_assets');

    // Clear existing photos before reindexing
    console.log('Clearing existing photo records...');
    await db.delete(photos);

    // Get all directories (categories)
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const categoryDirs = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    console.log(`Found ${categoryDirs.length} category directories`);

    // Process each category directory
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
        !file.toLowerCase().includes('-thumb') && // Exclude thumbnail files
        !file.toLowerCase().includes('placeholder') // Exclude placeholder images
      );

      console.log(`Found ${imageFiles.length} images in ${categoryName}`);

      // Sort files to process main images first
      imageFiles.sort((a, b) => {
        const aIsMain = isMainImage(a);
        const bIsMain = isMainImage(b);
        return bIsMain ? 1 : aIsMain ? -1 : 0;
      });

      // Process each image
      let displayOrderCounter = 1;
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

          // Set display order: main images get highest priority (1000)
          const displayOrder = isMainImage(imageFile) ? 1000 : displayOrderCounter++;

          // Insert new photo
          await db.insert(photos).values({
            title,
            category: categoryName,
            imageUrl: imageFile,
            thumbnailUrl,
            displayOrder
          });

          console.log(`Added photo: ${imageFile} in category ${categoryName} with title: ${title} and display order: ${displayOrder}`);
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