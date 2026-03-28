const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Meaning lookup for roots ranked 801-1200
// Each root's meaning is derived from its consonantal root and keyDerivatives
const _meanings = {
  // Will be populated below based on the actual roots at ranks 801-1200
};

// First, let's identify which roots are at positions 801-1200 (0-indexed: 800-1199)
const targetRoots = data.roots.slice(800, 1200);

console.log(`Roots 801-1200: ${targetRoots.length} entries`);
console.log(`First: rank 801 = ${targetRoots[0].root} (freq ${targetRoots[0].frequency})`);
console.log(`Last: rank 1200 = ${targetRoots[targetRoots.length-1].root} (freq ${targetRoots[targetRoots.length-1].frequency})`);

// Count how many already have meanings
const alreadyFilled = targetRoots.filter(r => r.meaning !== '').length;
const needFilling = targetRoots.filter(r => r.meaning === '').length;
console.log(`Already have meaning: ${alreadyFilled}`);
console.log(`Need filling: ${needFilling}`);

// Print all roots that need filling with their derivatives for reference
console.log('\n--- Roots needing meanings (801-1200) ---');
targetRoots.forEach((r, i) => {
  const rank = 801 + i;
  const derivs = r.keyDerivatives.map(d => d.form).join(', ');
  const status = r.meaning ? `[FILLED: ${r.meaning}]` : '[EMPTY]';
  console.log(`${rank}. ${r.root} (freq ${r.frequency}) ${status} -- ${derivs}`);
});
