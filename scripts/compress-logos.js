const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'public/logos';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

let totalBefore = 0;
let totalAfter = 0;

async function compressAll() {
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const sizeBefore = fs.statSync(fullPath).size;
        totalBefore += sizeBefore;

        const outPath = fullPath + '.tmp';
        try {
            await sharp(fullPath)
                .resize({ width: 320, height: 120, fit: 'inside', withoutEnlargement: true })
                .png({ compressionLevel: 9, palette: false, quality: 85 })
                .toFile(outPath);

            const sizeAfter = fs.statSync(outPath).size;
            totalAfter += sizeAfter;
            const saving = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(0);

            if (sizeAfter < sizeBefore) {
                fs.renameSync(outPath, fullPath);
                process.stdout.write(`✓ ${file}: ${(sizeBefore/1024).toFixed(0)}KB -> ${(sizeAfter/1024).toFixed(0)}KB (-${saving}%)\n`);
            } else {
                fs.unlinkSync(outPath);
                process.stdout.write(`= ${file}: already optimal (${(sizeBefore/1024).toFixed(0)}KB)\n`);
            }
        } catch (e) {
            process.stdout.write(`✗ ${file}: ERROR - ${e.message}\n`);
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        }
    }

    process.stdout.write(`\nTotal: ${(totalBefore/1024).toFixed(0)}KB -> ${(totalAfter/1024).toFixed(0)}KB\n`);
}

compressAll();
