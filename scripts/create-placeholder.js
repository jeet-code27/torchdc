const sharp = require('sharp');
const path = require('path');

const svg = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" rx="32" fill="#edf4ec"/>
  <circle cx="300" cy="270" r="110" fill="#5A805B" fill-opacity="0.12"/>
  <path d="M300 190 C286 225 245 255 245 290 C245 325 270 350 300 350 C330 350 355 325 355 290 C355 255 314 225 300 190 Z" fill="#5A805B"/>
  <text x="300" y="415" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#2d422e" text-anchor="middle" letter-spacing="3">TORCH</text>
  <text x="300" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#5A805B" text-anchor="middle" letter-spacing="1">CURATED CANNABIS</text>
</svg>
`;

const outputPath = path.resolve(__dirname, '../../../../../../../../AAA BizBox/19 - Torch/public/images/placeholder-product.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(path.resolve('public/images/placeholder-product.png'))
  .then(() => console.log('Successfully created public/images/placeholder-product.png'))
  .catch((err) => console.error('Error generating image:', err));
