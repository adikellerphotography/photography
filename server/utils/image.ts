import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function generateThumbnail(imagePath: string): Promise<string> {
  try {
    const ext = path.extname(imagePath);
    const categoryName = path.basename(path.dirname(imagePath));
    const fileName = path.basename(imagePath);
    const thumbnailPath = path.join(process.cwd(), 'attached_assets', categoryName, fileName.replace(ext, `-thumb${ext}`));

    await sharp(imagePath)
      .resize(600, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toFile(thumbnailPath);

    return path.basename(thumbnailPath);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return original filename if thumbnail generation fails
    return path.basename(imagePath);
  }
}

export async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
}