
import sharp from 'sharp';
import path from 'path';

export async function createWatermark(width: number, height: number) {
  const svg = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: rgba(255,255,255,0.5); font-size: 24px; font-family: Arial; }
      </style>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        class="title"
        transform="rotate(-45, ${width/2}, ${height/2})"
      >
        Adi Keller Photography
      </text>
    </svg>`;

  return Buffer.from(svg);
}
