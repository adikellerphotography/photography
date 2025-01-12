import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function generateThumbnail(imagePath: string): Promise<string> {
  const ext = path.extname(imagePath);
  const thumbnailPath = imagePath.replace(ext, `-thumb${ext}`);
  
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

  return thumbnailPath;
}
