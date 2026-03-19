// Compute 17 evenly-distributed virtual positions around the colosseum tower
// Tower tiers measured from door-map.json:
//   - Tier 1: y=5,  radius≈48 (widest base)
//   - Tier 2: y=27, radius≈38
//   - Tier 3: y=44, radius≈30
//   - Tier 4: y=54, radius≈27
//   - Tier 5: y=67, radius≈18

const tiers = [
    { y: 8,  r: 48, slots: 4, startAngle: 0   },
    { y: 27, r: 38, slots: 4, startAngle: 45  },
    { y: 44, r: 30, slots: 3, startAngle: 20  },
    { y: 54, r: 27, slots: 3, startAngle: 80  },
    { y: 67, r: 18, slots: 3, startAngle: 135 },
];

// Company IDs in the order they'll be placed (outer to inner, clockwise)
const companyIds = [
    // Tier 1: 0, 90, 180, 270
    "al_tawasul",
    "inmobiles",
    "arkan_al_dar",
    "al_tamaddon",
    // Tier 2: 45, 135, 225, 315
    "dazly",
    "himmati",
    "iraqi_insurance",
    "ameer_al_middle_east",
    // Tier 3: 20, 140, 260
    "baghdad_wings",
    "al_takween",
    "mawaraa_al_bihar",
    // Tier 4: 80, 200, 320
    "nidaa_al_ard",
    "al_arabiya_international",
    "al_zawraa",
    // Tier 5: 135, 255, 15
    "arabian_holding_group",
    "al_irtikaz",
    "imkanat",
];

const results = [];
let companyIndex = 0;

tiers.forEach(tier => {
    const angleStep = 360 / tier.slots;
    for (let i = 0; i < tier.slots; i++) {
        const angleDeg = tier.startAngle + i * angleStep;
        const angleRad = angleDeg * Math.PI / 180;
        const x = parseFloat((tier.r * Math.sin(angleRad)).toFixed(2));
        const z = parseFloat((tier.r * Math.cos(angleRad)).toFixed(2));
        const id = companyIds[companyIndex++];
        results.push({ id, x, y: tier.y, z, angleDeg: angleDeg.toFixed(0) });
    }
});

console.log('beaconPosition assignments:\n');
results.forEach(r => {
    console.log(`"${r.id}": [${r.x}, ${r.y}, ${r.z}],  // angle ~${r.angleDeg}°`);
});
