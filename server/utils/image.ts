import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function generateThumbnail(imagePath: string): Promise<string> {
  try {
    const ext = path.extname(imagePath);
    const categoryName = path.basename(path.dirname(imagePath));
    const fileName = path.basename(imagePath);
    const thumbnailPath = path.join(process.cwd(), 'attached_assets', categoryName, fileName.replace(ext, `-thumb${ext}`));

    // Ensure sharp is properly initialized
    await sharp.cache(false);

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

export async function addWatermark(
  imagePath: string | Buffer,
  watermarkText: string = '© Adi Keller Photography',
  outputPath?: string
): Promise<Buffer> {
  try {
    const watermarkSvg = `
      <svg width="500" height="100">
        <style>
          .text { 
            fill: rgba(255, 255, 255, 0.7); 
            font-size: 24px; 
            font-family: Arial;
            text-anchor: middle;
          }
        </style>
        <text x="50%" y="50%" class="text">${watermarkText}</text>
      </svg>
    `;

    // Initialize sharp with the input
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width = 1000, height = 1000 } = metadata;

    // Calculate watermark size based on image dimensions
    const watermarkWidth = Math.min(500, width * 0.8);
    const watermarkHeight = Math.min(100, height * 0.1);

    const watermarkedImage = await image
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
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error('Error processing image for download:', error);
    throw error;
  }
}