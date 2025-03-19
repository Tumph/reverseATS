const fs = require('fs');
const { createCanvas } = require('canvas');

// Sizes for the icons
const sizes = [48, 128];

// Function to draw the icon on a canvas
function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const scale = size / 24; // Our icon design is based on 24x24
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set the blue color used in our icon
  const blueColor = '#1a73e8';
  
  // Apply scaling
  ctx.save();
  ctx.scale(scale, scale);
  
  // Draw the outer square (border)
  ctx.fillStyle = blueColor;
  ctx.beginPath();
  // Outer square
  ctx.moveTo(5, 3);
  ctx.lineTo(19, 3);
  ctx.quadraticCurveTo(21, 3, 21, 5);
  ctx.lineTo(21, 19);
  ctx.quadraticCurveTo(21, 21, 19, 21);
  ctx.lineTo(5, 21);
  ctx.quadraticCurveTo(3, 21, 3, 19);
  ctx.lineTo(3, 5);
  ctx.quadraticCurveTo(3, 3, 5, 3);
  ctx.closePath();
  
  // Inner square (to create the border effect)
  ctx.moveTo(5, 5);
  ctx.lineTo(19, 5);
  ctx.lineTo(19, 19);
  ctx.lineTo(5, 19);
  ctx.closePath();
  
  // Use 'evenodd' fill rule to create the border effect
  ctx.fill('evenodd');
  
  // Draw the grid boxes
  // First row
  ctx.fillRect(7, 7, 2, 2);  // Left
  ctx.fillRect(11, 7, 2, 2);  // Middle
  ctx.fillRect(15, 7, 2, 2);  // Right
  
  // Second row
  ctx.fillRect(7, 12, 2, 5);  // Left
  ctx.fillRect(11, 12, 2, 5);  // Middle
  ctx.fillRect(15, 12, 2, 5);  // Right
  
  ctx.restore();
}

// Generate icons for each size
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  drawIcon(canvas, size);
  
  // Write the PNG file
  const buffer = canvas.toBuffer('image/png');
  const fileName = `src/image${size}.png`;
  fs.writeFileSync(fileName, buffer);
  
  console.log(`Created icon at ${fileName}`);
});

console.log('Icon generation complete!'); 