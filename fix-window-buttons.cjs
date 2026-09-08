const fs = require('fs');

let mainStr = fs.readFileSync('main.cjs', 'utf8');

// We need to keep frame: false to completely remove the ugly Windows border, 
// and handle our own titlebar logic. The previous hidden titlebar overlay creates 
// standard Windows buttons that we can't style properly to fit our dark theme.

mainStr = mainStr.replace(
  /titleBarStyle: 'hidden',\s*titleBarOverlay: \{\s*color: '#09090b',\s*symbolColor: '#ffffff'\s*\},/g,
  'frame: false,\n    titleBarStyle: "hidden",'
);

fs.writeFileSync('main.cjs', mainStr);
console.log("Updated main.cjs for custom window buttons.");
