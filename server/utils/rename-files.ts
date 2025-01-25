
import fs from 'fs/promises';
import path from 'path';

async function renameFilesInDirectory(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
    
    // Sort files to ensure consistent ordering
    imageFiles.sort();
    
    for (let i = 0; i < imageFiles.length; i++) {
      const oldPath = path.join(dirPath, imageFiles[i]);
      const newName = `${String(i + 1).padStart(3, '0')}.jpeg`;
      const newPath = path.join(dirPath, newName);
      
      if (imageFiles[i] !== newName) {
        await fs.rename(oldPath, newPath);
        console.log(`Renamed ${imageFiles[i]} to ${newName}`);
      }
    }
    
    console.log(`File renaming completed for ${dirPath}`);
  } catch (error) {
    console.error(`Error renaming files in ${dirPath}:`, error);
  }
}

async function renameAllDirectories() {
  const directories = [
    'Artful_Nude',
    'Femininity',
    'Modeling'
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), 'attached_assets', dir);
    console.log(`Processing directory: ${dir}`);
    await renameFilesInDirectory(dirPath);
  }
}

renameAllDirectories();
