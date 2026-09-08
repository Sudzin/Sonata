const fs = require('fs');

// The issue is likely that Electron in production isn't finding preload.cjs 
// because of how we build it or where it's looking for it.
// Let's modify package.json one more time to be absolutely certain it's packaged.
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.build.extraResources = [
  "preload.cjs"
];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// In main.cjs, let's look for preload.cjs in both standard path and resources path
let mainCode = fs.readFileSync('main.cjs', 'utf8');

mainCode = mainCode.replace(
  /preload: path\.join\(__dirname, 'preload\.cjs'\)/,
  `preload: app.isPackaged ? path.join(process.resourcesPath, 'preload.cjs') : path.join(__dirname, 'preload.cjs')`
);

fs.writeFileSync('main.cjs', mainCode);
console.log("Updated preload path resolution for production!");
