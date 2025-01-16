import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

import { createWatermark } from './watermark';

export async function generateThumbnail(imagePath: string): Promise<string> {
  const ext = path.extname(imagePath);
  const categoryName = path.basename(path.dirname(imagePath));
  const fileName = path.basename(imagePath);
  const thumbnailPath = path.join(process.cwd(), 'attached_assets', categoryName, fileName.replace(ext, `-thumb${ext}`));

  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  const watermark = await createWatermark(
    metadata.width || 600,
    metadata.height || 800
  );

  await image
    .resize(600, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .composite([
      {
        input: watermark,
        gravity: 'center',
      },
    ])
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toFile(thumbnailPath);

  return path.basename(thumbnailPath);
}

export async function addWatermark(imagePath: string): Promise<Buffer> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  const watermark = await createWatermark(
    metadata.width || 1200,
    metadata.height || 1600
  );

  return image
    .composite([
      {
        input: watermark,
        gravity: 'center',
      },
    ])
    .jpeg({
      quality: 90,
      progressive: true,
    })
    .toBuffer();
}