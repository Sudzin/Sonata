const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Optimize build size by disabling unnecessary ASAR packing features if present
if (!pkg.build.asar) {
  pkg.build.asar = true;
}

// Write it back
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
