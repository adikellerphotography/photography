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

  // Remove any double spaces and numbers
  title = title.replace(/\s+/g, ' ').replace(/\d+/g, '').trim();

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
    const assetsPath = path.join(process.cwd(), 'attached_assets');

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

      // Check for 1.jpeg in the category directory
      const categoryThumbName = '1.jpeg';
      const categoryThumbPath = path.join(fullPath, categoryThumbName);
      let hasCategoryThumb = false;

      try {
        await fs.access(categoryThumbPath);
        hasCategoryThumb = true;
      } catch (error) {
        console.log(`No ${categoryThumbName} found for category ${categoryName}`);
      }

      // Ensure category exists in database
      await db.insert(categories)
        .values({
          name: categoryName,
          displayOrder: 1,
          description: `${categoryName} photography collection`,
          thumbnailImage: hasCategoryThumb ? categoryThumbName : undefined
        })
        .onConflictDoUpdate({
          target: categories.name,
          set: { 
            description: `${categoryName} photography collection`,
            thumbnailImage: hasCategoryThumb ? categoryThumbName : undefined
          }
        });

      // Get all images in this category
      const files = await fs.readdir(fullPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png)$/i.test(file) && 
        !file.includes('-thumb') && // Exclude thumbnail files
        !file.includes('1.jpeg') && // Skip the category thumbnail
        !file.includes('1.jpg')     // Skip the category thumbnail
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

            // Generate a meaningful title for the photo
            const title = formatTitle(imageFile, categoryName);

            // Insert new photo
            await db.insert(photos).values({
              title,
              category: categoryName,
              imageUrl: imageFile,
              thumbnailUrl,
              displayOrder: 1
            });

            console.log(`Added new photo: ${imageFile} in category ${categoryName} with title: ${title}`);
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