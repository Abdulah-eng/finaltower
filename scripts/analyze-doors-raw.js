// Raw GLB parser to extract door mesh node names and translations
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'models', 'colleseum_final.glb');
const buf = fs.readFileSync(filePath);

// GLB header: magic(4) + version(4) + length(4)
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546C67) { console.error('Not a GLB file'); process.exit(1); }

// Chunk 0: JSON
const jsonLen = buf.readUInt32LE(12);
// const jsonType = buf.readUInt32LE(16); // should be 0x4E4F534A = JSON
const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
const gltf = JSON.parse(jsonStr);

const nodes = gltf.nodes || [];

// Gather all door nodes (not anim/close/open)
const doorNodes = nodes.filter(n => n.name && /door\d/i.test(n.name) && !/anim|close|open/i.test(n.name));

// Sort numerically
doorNodes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

console.log(`Found ${doorNodes.length} door nodes:\n`);
console.log('Name                      | X       | Y       | Z       | Angle°');
console.log('--------------------------|---------|---------|---------|--------');

const grouped = {};

doorNodes.forEach(n => {
    const t = n.translation || [0, 0, 0];
    const [x, y, z] = t;
    const angle = Math.atan2(x, z) * 180 / Math.PI;
    const angleStr = angle.toFixed(0) + '°';

    console.log(
        n.name.padEnd(26) + '| ' +
        x.toFixed(2).padStart(7) + ' | ' +
        y.toFixed(2).padStart(7) + ' | ' +
        z.toFixed(2).padStart(7) + ' | ' +
        angleStr.padStart(7)
    );

    // Try to group by floor (Y coordinate rounded)
    const floorKey = Math.round(y);
    if (!grouped[floorKey]) grouped[floorKey] = [];
    grouped[floorKey].push({ name: n.name, x, y, z, angle });
});

console.log('\n\n=== GROUPED BY FLOOR (Y) ===');
const floorKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b);
floorKeys.forEach(f => {
    const entries = grouped[f].sort((a, b) => a.angle - b.angle);
    console.log(`\nFloor Y≈${f} (${entries.length} doors):`);
    entries.forEach(e => {
        console.log(`  ${e.name.padEnd(22)} angle: ${e.angle.toFixed(0).padStart(5)}°`);
    });
    // Check min angle gap
    if (entries.length > 1) {
        const angles = entries.map(e => e.angle).sort((a, b) => a - b);
        const gaps = angles.map((a, i) => i < angles.length - 1 ? angles[i + 1] - a : null).filter(g => g !== null);
        const minGap = Math.min(...gaps);
        console.log(`  Min gap between adjacent doors: ${minGap.toFixed(0)}°`);
    }
});
