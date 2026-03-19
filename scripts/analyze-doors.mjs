import { NodeIO } from '@gltf-transform/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '..', 'public', 'models', 'colleseum_final.glb');

const io = new NodeIO();
const document = await io.read(modelPath);
const root = document.getRoot();

// Collect all nodes with "door" in their name
const doorNodes = [];

root.listNodes().forEach(node => {
    const name = node.getName();
    if (/door\d/i.test(name) && !/anim|close|open/i.test(name)) {
        const translation = node.getTranslation();
        const x = translation ? translation[0] : 0;
        const y = translation ? translation[1] : 0;
        const z = translation ? translation[2] : 0;
        const angle = Math.atan2(x, z) * (180 / Math.PI); // degrees around Y axis
        doorNodes.push({ name, x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2), angle: angle.toFixed(1) });
    }
});

// Sort by name
doorNodes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

console.log(`Found ${doorNodes.length} door nodes:\n`);
console.log('Name                     | X      | Y      | Z      | Angle°');
console.log('-------------------------|--------|--------|--------|--------');
doorNodes.forEach(d => {
    console.log(`${d.name.padEnd(25)}| ${d.x.padStart(6)} | ${d.y.padStart(6)} | ${d.z.padStart(6)} | ${d.angle.padStart(6)}`);
});
