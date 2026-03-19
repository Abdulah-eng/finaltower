const fs = require('fs');
const path = require('path');

// Check which door models are referenced in companies.ts
const companiesContent = fs.readFileSync('src/data/companies.ts', 'utf8');

// Find used door models
const usedDoorModels = new Set();
const doorMatches = companiesContent.matchAll(/doorModel:\s*"([^"]+)"/g);
for (const m of doorMatches) usedDoorModels.add(m[1]);

// Find used logos
const usedLogos = new Set();
const logoMatches = companiesContent.matchAll(/logo:\s*"\/logos\/([^"]+)"/g);
for (const m of logoMatches) usedLogos.add(m[1]);

// Find used main model paths
const usedModels = new Set();
const modelMatches = companiesContent.matchAll(/\/models\/([^"']+)/g);
for (const m of modelMatches) usedModels.add(m[1]);

// Also scan all .tsx/.ts files for any other asset references
function scanDir(dir, exts) {
    let content = '';
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
            content += scanDir(full, exts);
        } else if (exts.some(e => entry.name.endsWith(e))) {
            content += fs.readFileSync(full, 'utf8');
        }
    });
    return content;
}

const allCodeContent = scanDir('src', ['.ts', '.tsx', '.js', '.jsx']);

// Door models in folder vs used
console.log('\n=== DOOR MODELS ===');
const doorDir = 'public/models/doors';
fs.readdirSync(doorDir).forEach(f => {
    const id = f.replace('.glb', '');
    const size = fs.statSync(path.join(doorDir, f)).size;
    const used = usedDoorModels.has(id) || allCodeContent.includes(id);
    console.log((used ? '[USED]  ' : '[UNUSED]') + ' ' + id + '.glb  ' + (size/1024/1024).toFixed(2) + 'MB');
});

// Main models
console.log('\n=== MAIN MODELS ===');
fs.readdirSync('public/models').filter(f => f.endsWith('.glb')).forEach(f => {
    const refName = f;
    const size = fs.statSync('public/models/' + f).size;
    const used = allCodeContent.includes(f);
    console.log((used ? '[USED]  ' : '[UNUSED]') + ' ' + f + '  ' + (size/1024/1024).toFixed(2) + 'MB');
});

// Logos
console.log('\n=== LOGOS ===');
let totalUnusedLogoSize = 0;
fs.readdirSync('public/logos').forEach(f => {
    const used = usedLogos.has(f) || allCodeContent.includes(f);
    const size = fs.statSync('public/logos/' + f).size;
    if (!used) {
        totalUnusedLogoSize += size;
        console.log('[UNUSED] ' + f + '  ' + (size/1024).toFixed(0) + 'KB');
    }
});
console.log('Total unused logo size:', (totalUnusedLogoSize/1024).toFixed(0) + 'KB');

// Default Next.js assets
console.log('\n=== NEXT.JS DEFAULT ASSETS (safe to delete) ===');
['file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg'].forEach(f => {
    const p = 'public/' + f;
    if (fs.existsSync(p)) {
        const used = allCodeContent.includes(f);
        console.log((used ? '[USED]  ' : '[UNUSED]') + ' ' + f);
    }
});
