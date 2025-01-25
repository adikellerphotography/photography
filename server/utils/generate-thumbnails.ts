import { db } from "@db";
import { photos } from "@db/schema";
import path from "path";
import { eq, isNull } from "drizzle-orm";
import sharp from 'sharp';

export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  width: number = 300
) {
  try {
    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    console.log(`Generated thumbnail: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating thumbnail for ${inputPath}:`, error);
    throw error;
  }
}

export async function generateMissingThumbnails() {
  try {
    // Get all photos that don't have thumbnails
    const photosWithoutThumbnails = await db
      .select()
      .from(photos)
      .where(isNull(photos.thumbnailUrl));

    console.log(`Found ${photosWithoutThumbnails.length} photos without thumbnails`);

    // Generate thumbnails for each photo
    for (const photo of photosWithoutThumbnails) {
      try {
        // Create full path including category folder
        const fullImagePath = path.join(process.cwd(), 'attached_assets', photo.category, photo.imageUrl);
        const thumbnailDir = path.join(process.cwd(), 'attached_assets', photo.category, 'thumbnails');
        const thumbnailFileName = `${photo.id}.jpg`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);

        await generateThumbnail(fullImagePath, thumbnailPath);

        // Update the photo record with the thumbnail path
        await db
          .update(photos)
          .set({
            thumbnailUrl: path.join('attached_assets', photo.category, 'thumbnails', thumbnailFileName),
          })
          .where(eq(photos.id, photo.id));

        console.log(`Generated thumbnail for photo ${photo.id}: ${photo.title}`);
      } catch (error) {
        console.error(`Error processing photo ${photo.id}:`, error);
      }
    }

    console.log('Thumbnail generation complete');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw error;
  }
}