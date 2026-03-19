// Raw GLB parser - CSV output for door mesh positions
const fs = require('fs');
const filePath = 'd:/projects/newtower/web/public/models/colleseum_final.glb';
const buf = fs.readFileSync(filePath);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const nodes = gltf.nodes || [];

const doorNodes = nodes.filter(n => n.name && /door\d/i.test(n.name) && !/anim|close|open/i.test(n.name));
doorNodes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

const lines = ['name,x,y,z,angle'];
doorNodes.forEach(n => {
    const [x, y, z] = n.translation || [0, 0, 0];
    const angle = Math.atan2(x, z) * 180 / Math.PI;
    lines.push(`${n.name},${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)},${angle.toFixed(1)}`);
});

fs.writeFileSync('d:/projects/newtower/web/scripts/door-positions.csv', lines.join('\n'));
console.log('Written', doorNodes.length, 'rows to door-positions.csv');
