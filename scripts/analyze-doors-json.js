// Output door positions as JSON for reliable reading
const fs = require('fs');
const filePath = 'd:/projects/newtower/web/public/models/colleseum_final.glb';
const buf = fs.readFileSync(filePath);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const nodes = gltf.nodes || [];

const doorNodes = nodes
    .filter(n => n.name && /door\d/i.test(n.name) && !/anim|close|open/i.test(n.name))
    .map(n => {
        const [x, y, z] = n.translation || [0, 0, 0];
        const angle = Math.atan2(x, z) * 180 / Math.PI;
        return { name: n.name, x, y, z, angle };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

// Group by floor (Y rounded to nearest 10)
const floors = {};
doorNodes.forEach(d => {
    const fy = Math.round(d.y / 10) * 10;
    if (!floors[fy]) floors[fy] = [];
    floors[fy].push({ name: d.name, angle: Math.round(d.angle) });
});

// Sort angles within floors
Object.keys(floors).forEach(f => {
    floors[f].sort((a, b) => a.angle - b.angle);
});

const result = { doors: doorNodes, byFloor: floors };
fs.writeFileSync('d:/projects/newtower/web/scripts/door-map.json', JSON.stringify(result, null, 2));
console.log('Done. Wrote door-map.json with', doorNodes.length, 'doors');
