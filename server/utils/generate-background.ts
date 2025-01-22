
import sharp from 'sharp';
import path from 'path';

async function generateBlackBackground() {
  try {
    const width = 1920;
    const height = 1080;
    
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .jpeg()
    .toFile(path.join(process.cwd(), 'attached_assets', 'black_background.jpeg'));

    console.log('Black background image created successfully');
  } catch (error) {
    console.error('Error generating black background:', error);
  }
}

generateBlackBackground();
