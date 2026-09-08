const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add portable target so the user gets a single, standalone .exe file
pkg.build.win.target = ["nsis", "portable"];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("package.json updated with portable target");
