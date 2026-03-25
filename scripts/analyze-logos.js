const fs = require('fs');
const content = fs.readFileSync('d:/projects/newtower/web/src/data/companies.ts', 'utf8');

// Regex to capture id, name, and beaconPosition
const regex = /id:\s*\"([^\"]+)\",\s*name:\s*\"([^\"]+)\"[\s\S]*?beaconPosition:\s*\[([^\]]+)\]/g;
const companies = [];
let match;

while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const name = match[2];
    const pos = match[3].split(',').map(v => parseFloat(v.trim()));
    
    // Calculate angle in degrees (0-360)
    let angle = Math.atan2(pos[2], pos[0]) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    companies.push({ id, name, x: pos[0], y: pos[1], z: pos[2], angle });
}

const tiers = [8, 27, 44, 54, 67];
console.log('Angular Distribution of Logos by Tier:\n');

tiers.forEach(y => {
    const onTier = companies.filter(c => Math.abs(c.y - y) < 1).sort((a,b) => a.angle - b.angle);
    if (onTier.length === 0) return;
    
    console.log(`--- Tier y=${y} (${onTier.length} logos) ---`);
    onTier.forEach((c, i) => {
        const prev = onTier[i === 0 ? onTier.length - 1 : i - 1];
        let diff = c.angle - prev.angle;
        if (diff < 0) diff += 360;
        console.log(`${c.name.padEnd(40)} Angle: ${c.angle.toFixed(1)}° (Diff: ${diff.toFixed(1)}°)`);
    });
    console.log('');
});
