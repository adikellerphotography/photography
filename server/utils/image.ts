
import sharp from 'sharp';
import path from 'path';

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
