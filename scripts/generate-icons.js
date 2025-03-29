import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
// Splash screen sizes for different devices
const splashSizes = [
  { width: 640, height: 1136 },  // iPhone 5
  { width: 750, height: 1334 },  // iPhone 6/7/8
  { width: 828, height: 1792 },  // iPhone XR
  { width: 1125, height: 2436 }, // iPhone X/XS
  { width: 1242, height: 2688 }, // iPhone XS Max
  { width: 1536, height: 2048 }, // iPad Mini/Air
  { width: 1668, height: 2224 }, // iPad Pro 10.5"
  { width: 2048, height: 2732 }  // iPad Pro 12.9"
];

const inputFile = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');
const splashDir = path.join(__dirname, '../public/splash');

// Create output directories if they don't exist
[outputDir, splashDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate icons
console.log('Generating icons...');
iconSizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(info => {
      console.log(`Generated ${size}x${size} icon`);
    })
    .catch(err => {
      console.error(`Error generating ${size}x${size} icon:`, err);
    });
});

// Generate splash screens
console.log('\nGenerating splash screens...');
splashSizes.forEach(size => {
  // Calculate logo size (40% of smallest dimension)
  const logoSize = Math.min(size.width, size.height) * 0.4;
  
  // Create a white background with logo in center
  sharp(inputFile)
    .resize(Math.round(logoSize), Math.round(logoSize), {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer()
    .then(resizedLogo => {
      return sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{
        input: resizedLogo,
        gravity: 'center'
      }])
      .toFile(path.join(splashDir, `splash-${size.width}x${size.height}.png`));
    })
    .then(info => {
      console.log(`Generated ${size.width}x${size.height} splash screen`);
    })
    .catch(err => {
      console.error(`Error generating ${size.width}x${size.height} splash screen:`, err);
    });
}); 