
import sharp from 'sharp';
import path from 'path';

async function generateTexturedBackground() {
  try {
    const width = 1920;
    const height = 1080;
    
    // Create SVG with wave pattern
    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <pattern id="wave-pattern" patternUnits="userSpaceOnUse" width="800" height="800" patternTransform="rotate(15) scale(0.8)">
            <path d="M0,400 C200,320 300,480 800,400 M0,400 C300,480 500,320 800,400" 
                  fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.5"/>
            <path d="M0,200 C200,120 300,280 800,200 M0,200 C300,280 500,120 800,200" 
                  fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/>
            <path d="M0,600 C200,520 300,680 800,600 M0,600 C300,680 500,520 800,600" 
                  fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="black"/>
        <rect width="100%" height="100%" fill="url(#wave-pattern)"/>
      </svg>`;

    await sharp(Buffer.from(svg))
      .resize(width, height)
      .jpeg({ quality: 100 })
      .toFile(path.join(process.cwd(), 'attached_assets', 'black_background2.jpeg'));

    console.log('Textured black background created successfully');
  } catch (error) {
    console.error('Error generating background:', error);
  }
}

generateTexturedBackground();
