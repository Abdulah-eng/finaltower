const fs = require('fs');
const path = require('path');

const logoDir = path.join(__dirname, '../public/logos');
const files = fs.readdirSync(logoDir);

console.log('Found files:', files.length);

const mapping = {
    "-A-r-a-b-i-a-n- -H-o-l-d-i-n-g- -G-r-o-u-p- -–- -I-r-a-q-.-p-n-g-": "Arabian Holding Group - Iraq.png",
    "-I-N-M-O-B-I-L-E-S- -–- -F-Z-C-O-.-p-n-g-": "INMOBILES - FZCO.png",
    "-S-m-a-r-t---C-i-t-y-.-p-n-g-": "Smart-City.png",
    "-A-l---T-a-k-w-e-e-n-.-p-n-g-": "Al-Takween.png",
    "-D-e-s-e-r-t---S-t-a-r-.-p-n-g-": "Desert-Star.png",
    "-B-l-u-e---O-c-e-a-n-.-p-n-g-": "Blue-Ocean.png",
    "-A-l---Z-a-w-r-a-a-.-p-n-g-": "Al-Zawraa.png",
    "-A-l---M-u-t-a-m-a-y-e-z-.-p-n-g-": "Al-Mutamayez.png",
    "-A-l---R-a-y-y-a-n-.-p-n-g-": "Al-Rayyan.png",
    "-G-o-l-d-e-n---S-a-n-d-.-p-n-g-": "Golden-Sand.png",
    "-A-l---T-a-f-a-n-i-.-p-n-g-": "Al-Tafani.png",
    "-A-l---J-a-w-d-a-.-p-n-g-": "Al-Jawda.png",
    "-I-m-k-a-n-a-t-.-p-n-g-": "Imkanat.png",
    "-B-a-g-h-d-a-d---W-i-n-g-s-.-p-n-g-": "Baghdad-Wings.png",
    "-M-a-w-a-r-a-a---A-l---B-i-h-a-r-.-p-n-g-": "Mawaraa-Al-Bihar.png",
    "-A-l---A-s-r-i-y-a-.-p-n-g-": "Al-Asriya.png",
    "-A-l---F-u-r-a-a-t-.-p-n-g-": "Al-Furaat.png"
};

files.forEach(file => {
    const newName = mapping[file];
    if (newName) {
        console.log(`Renaming: ${file} -> ${newName}`);
        fs.renameSync(path.join(logoDir, file), path.join(logoDir, newName));
    } else {
        // Fallback for character-by-character corruption if exact match fails
        if (file.startsWith('-') && file.endsWith('-')) {
            let decoded = file.substring(1, file.length - 1)
                              .replace(/---/g, '|') // Temporary marker for original hyphens
                              .replace(/-/g, '')
                              .replace(/\|/g, '-')
                              .replace(/–/g, '-'); // Final en-dash fix
            console.log(`Pattern Decoded: ${file} -> ${decoded}`);
            fs.renameSync(path.join(logoDir, file), path.join(logoDir, decoded));
        }
    }
});
