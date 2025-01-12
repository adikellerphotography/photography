import { db } from "@db";
import { photos } from "@db/schema";
import { generateThumbnail } from "./image";
import path from "path";
import { eq, isNull } from "drizzle-orm";

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
        const fullImagePath = path.join(process.cwd(), 'attached_assets', photo.imageUrl);
        const thumbnailPath = await generateThumbnail(fullImagePath);

        // Update the photo record with the thumbnail path
        await db
          .update(photos)
          .set({
            thumbnailUrl: thumbnailPath,
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