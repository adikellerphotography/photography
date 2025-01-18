import sharp from 'sharp';

export async function addWatermark(imagePath: string): Promise<Buffer> {
  return sharp(imagePath)
    .jpeg({
      quality: 90,
      progressive: true,
    })
    .toBuffer();
}