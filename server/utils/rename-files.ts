
import fs from 'fs/promises';
import path from 'path';

async function renameFiles() {
  const dirPath = path.join(process.cwd(), 'attached_assets', 'Bat_Mitsva');
  try {
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => /\.jpeg$/i.test(file));
    
    for (let i = 0; i < imageFiles.length; i++) {
      const oldPath = path.join(dirPath, imageFiles[i]);
      const newName = `${String(i + 1).padStart(3, '0')}.jpeg`;
      const newPath = path.join(dirPath, newName);
      
      await fs.rename(oldPath, newPath);
      console.log(`Renamed ${imageFiles[i]} to ${newName}`);
    }
    
    console.log('File renaming completed successfully');
  } catch (error) {
    console.error('Error renaming files:', error);
  }
}

renameFiles();
