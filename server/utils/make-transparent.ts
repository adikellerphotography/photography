
import sharp from 'sharp';
import path from 'path';

async function makeTransparent(imagePath: string) {
  try {
    const outputPath = path.join(
      process.cwd(),
      'attached_assets',
      'AK_transparent.png'
    );

    await sharp(imagePath)
      .removeAlpha()
      .ensureAlpha()
      .flatten({ background: { r: 0, g: 0, b: 0 } })
      .threshold(10)
      .toFormat('png')
      .toFile(outputPath);

    console.log('Successfully created transparent version');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

makeTransparent(path.join(process.cwd(), 'attached_assets', 'AK.jpg'));
