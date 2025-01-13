import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function generateThumbnail(imagePath: string, forceRegenerate: boolean = false): Promise<string> {
  const ext = path.extname(imagePath);
  const categoryName = path.basename(path.dirname(imagePath));
  const fileName = path.basename(imagePath);
  const thumbnailPath = path.join(process.cwd(), 'attached_assets', categoryName, fileName.replace(ext, `-thumb${ext}`));

  // Check if thumbnail already exists and we're not forcing regeneration
  try {
    if (!forceRegenerate) {
      await fs.access(thumbnailPath);
      console.log(`Thumbnail already exists for ${fileName}`);
      return path.basename(thumbnailPath);
    }
  } catch (error) {
    // Thumbnail doesn't exist or we're forcing regeneration, continue
  }

  try {
    console.log(`Generating thumbnail for ${fileName} at ${thumbnailPath}`);

    // Ensure the category directory exists
    const categoryDir = path.dirname(thumbnailPath);
    await fs.mkdir(categoryDir, { recursive: true });

    // Generate thumbnail using sharp with improved settings
    await sharp(imagePath)
      .resize(600, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
        optimizeCoding: true,
        mozjpeg: true,
      })
      .toFile(thumbnailPath);

    console.log(`Successfully generated thumbnail at ${thumbnailPath}`);
    return path.basename(thumbnailPath);
  } catch (error) {
    console.error(`Error generating thumbnail for ${fileName}:`, error);
    throw error;
  }
}