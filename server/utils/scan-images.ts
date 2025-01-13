import path from 'path';
import fs from 'fs/promises';
import { db } from "@db";
import { photos, categories } from "@db/schema";
import { processImage } from "./image";
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

      // Check if category is "Before and After" for special handling
      const isBeforeAfter = categoryName.toLowerCase() === 'before and after';

      // Ensure category exists in database
      await db.insert(categories)
        .values({
          name: categoryName,
          displayOrder: isBeforeAfter ? 999 : 1, // Put Before/After at the end
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

            // Process image and get its properties
            const { thumbnailUrl, width, height, orientation } = await processImage(imagePath);

            // Generate a meaningful title for the photo
            const title = formatTitle(imageFile, categoryName);

            // Check if this is a before/after image
            const isBeforeAfterImage = isBeforeAfter && /[-_][12]\s+Large\.(jpg|jpeg)$/i.test(imageFile);
            const beforeAfterGroup = isBeforeAfterImage ? 
              imageFile.replace(/[-_][12]\s+Large\.(jpg|jpeg)$/i, '') : 
              null;
            const isBeforeImage = isBeforeAfterImage ? 
              /[-_]1\s+Large\.(jpg|jpeg)$/i.test(imageFile) : 
              false;

            // Insert new photo
            await db.insert(photos).values({
              title,
              category: categoryName,
              imageUrl: imageFile,
              thumbnailUrl,
              displayOrder: 1,
              width,
              height,
              orientation,
              isBeforeAfter: isBeforeAfterImage,
              beforeAfterGroup: beforeAfterGroup,
              isBeforeImage: isBeforeImage
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