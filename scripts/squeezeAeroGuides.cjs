const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/aero-guides');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.paths.forEach(p => {
    p.points = p.points.map(pt => {
      // Scale X to bring it closer to the car's centerline
      // Scale Y slightly to bring it closer to the body vertically
      return [
        pt[0] * 0.65, // X 
        pt[1] * 0.9,  // Y
        pt[2]         // Z (lengthwise, keep as is)
      ];
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Processed ${file}`);
});
