const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Sizes for the icons
const sizes = [48, 128];

// Function to draw the icon on a canvas
function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const scale = size / 24; // SVG viewBox is 24x24
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set the blue color used in our icon
  const blueColor = '#1a73e8';
  
  // Apply scaling
  ctx.save();
  ctx.scale(scale, scale);
  
  ctx.fillStyle = blueColor;

  // Draw the outer rounded square (matches the first path in SVG)
  ctx.beginPath();
  // M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z
  
  // Border with rounded corners
  ctx.moveTo(19, 3);
  ctx.lineTo(5, 3);
  ctx.bezierCurveTo(3.9, 3, 3, 3.9, 3, 5);
  ctx.lineTo(3, 19);
  ctx.bezierCurveTo(3, 20.1, 3.9, 21, 5, 21);
  ctx.lineTo(19, 21);
  ctx.bezierCurveTo(20.1, 21, 21, 20.1, 21, 19);
  ctx.lineTo(21, 5);
  ctx.bezierCurveTo(21, 3.9, 20.1, 3, 19, 3);
  ctx.closePath();
  
  // Inner square cutout
  ctx.moveTo(19, 19);
  ctx.lineTo(5, 19);
  ctx.lineTo(5, 5);
  ctx.lineTo(19, 5);
  ctx.closePath();
  
  ctx.fill('evenodd');
  
  // Draw the grid (matches the second path in SVG)
  // M7 12h2v5H7v-5zm0-5h2v2H7V7zm4 0h2v2h-2V7zm0 5h2v5h-2v-5zm4-5h2v2h-2V7zm0 5h2v5h-2v-5z
  
  // First row boxes
  ctx.fillRect(7, 7, 2, 2);  // Left
  ctx.fillRect(11, 7, 2, 2);  // Middle
  ctx.fillRect(15, 7, 2, 2);  // Right
  
  // Second row boxes
  ctx.fillRect(7, 12, 2, 5);  // Left
  ctx.fillRect(11, 12, 2, 5);  // Middle
  ctx.fillRect(15, 12, 2, 5);  // Right
  
  ctx.restore();
}

// Get the path to the src directory (one level up from scripts)
const srcPath = path.join(__dirname, '..', 'src');

// Make sure the src directory exists
if (!fs.existsSync(srcPath)) {
  fs.mkdirSync(srcPath, { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  drawIcon(canvas, size);
  
  // Write the PNG file
  const buffer = canvas.toBuffer('image/png');
  const fileName = path.join(srcPath, `image${size}.png`);
  fs.writeFileSync(fileName, buffer);
  
  console.log(`Created icon at ${fileName}`);
});

console.log('Icon generation complete!'); 