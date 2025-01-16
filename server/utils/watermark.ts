
import sharp from 'sharp';
import path from 'path';

export async function createWatermark(width: number, height: number) {
  const svg = `
    <svg width="${width}" height="${height}">
      <style>
        .title { 
          fill: rgba(255,255,255,0.7); 
          font-size: 28px; 
          font-family: 'Georgia', serif; 
          font-weight: bold;
          letter-spacing: 1px;
        }
      </style>
      <text 
        x="50" 
        y="${height - 50}" 
        class="title"
      >
        Adi Keller Photography
      </text>
    </svg>`;

  return Buffer.from(svg);
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
        gravity: 'southwest',
      },
    ])
    .jpeg({
      quality: 90,
      progressive: true,
    })
    .toBuffer();
}
