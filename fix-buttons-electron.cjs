const fs = require('fs');

// We need to ensure preload.cjs is actually loaded correctly.
// Let's check main.cjs to see if __dirname is resolving properly in the packaged environment.
let mainCode = fs.readFileSync('main.cjs', 'utf8');

// Use path.join(__dirname, 'preload.cjs') robustly.
// If it fails, sometimes it's because preload is missing in the build.
// We need to make sure preload.cjs is copied during build, or better, we can inject the script directly or ensure it exists.

// Let's modify package.json to make sure preload.cjs is included.
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!pkg.build.files) {
  pkg.build.files = [];
}
if (!pkg.build.files.includes('preload.cjs')) {
  pkg.build.files.push('preload.cjs');
}
if (!pkg.build.files.includes('main.cjs')) {
  pkg.build.files.push('main.cjs');
}
if (!pkg.build.files.includes('dist/**/*')) {
  pkg.build.files.push('dist/**/*');
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Updated package.json to include preload.cjs in the build.");

// Let's make sure the paths in main.cjs are robust
mainCode = mainCode.replace(
  /preload: path\.join\(__dirname, 'preload\.cjs'\)/,
  `preload: path.join(__dirname, 'preload.cjs')`
);

fs.writeFileSync('main.cjs', mainCode);
