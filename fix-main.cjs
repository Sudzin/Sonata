const fs = require('fs');

let mainStr = fs.readFileSync('main.cjs', 'utf8');

// Add custom titlebar
mainStr = mainStr.replace(
  /autoHideMenuBar: true,/,
  `autoHideMenuBar: true,\n    titleBarStyle: 'hidden',\n    titleBarOverlay: {\n      color: '#09090b',\n      symbolColor: '#ffffff'\n    },`
);

fs.writeFileSync('main.cjs', mainStr);
console.log("main.cjs updated with frameless titlebar!");
