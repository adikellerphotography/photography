import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import sizeOf from 'image-size';

interface ImageDimensions {
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
}

export async function getImageDimensions(imagePath: string): Promise<ImageDimensions> {
  const dimensions = sizeOf(imagePath);
  const width = dimensions.width || 0;
  const height = dimensions.height || 0;

  let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
  if (width === height) {
    orientation = 'square';
  } else if (height > width) {
    orientation = 'portrait';
  }

  return { width, height, orientation };
}

export async function generateThumbnail(imagePath: string): Promise<string> {
  const ext = path.extname(imagePath);
  const categoryName = path.basename(path.dirname(imagePath));
  const fileName = path.basename(imagePath);
  const thumbnailPath = path.join(process.cwd(), 'attached_assets', categoryName, fileName.replace(ext, `-thumb${ext}`));

  try {
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
    throw error;
  }
}

export async function processImage(imagePath: string): Promise<{
  thumbnailUrl: string | undefined;
  width: number;
  height: number;
  orientation: string;
}> {
  try {
    const [thumbnailUrl, dimensions] = await Promise.all([
      generateThumbnail(imagePath),
      getImageDimensions(imagePath)
    ]);

    return {
      thumbnailUrl,
      ...dimensions
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}