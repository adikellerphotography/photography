import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function generateThumbnail(imagePath: string): Promise<string> {
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
}

export async function addWatermark(
  imagePath: string,
  watermarkText: string = '© Adi Keller Photography',
  outputPath?: string
): Promise<Buffer> {
  const watermarkSvg = `
    <svg width="500" height="100">
      <style>
        .text { 
          fill: rgba(255, 255, 255, 0.5); 
          font-size: 24px; 
          font-family: Arial;
          text-anchor: middle;
        }
      </style>
      <text x="50%" y="50%" class="text">${watermarkText}</text>
    </svg>
  `;

  const metadata = await sharp(imagePath).metadata();
  const { width = 1000, height = 1000 } = metadata;

  const watermarkedImage = await sharp(imagePath)
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        gravity: 'southeast',
        blend: 'over'
      }
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  if (outputPath) {
    await fs.writeFile(outputPath, watermarkedImage);
  }

  return watermarkedImage;
}

export async function processImageForDownload(
  imagePath: string,
  options: {
    watermark?: boolean;
    watermarkText?: string;
    quality?: number;
    maxWidth?: number;
  } = {}
): Promise<Buffer> {
  const {
    watermark = true,
    watermarkText = '© Adi Keller Photography',
    quality = 90,
    maxWidth = 2048
  } = options;

  let imageBuffer = await sharp(imagePath)
    .resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer();

  if (watermark) {
    imageBuffer = await addWatermark(imageBuffer, watermarkText);
  }

  return imageBuffer;
}