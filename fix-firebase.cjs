const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /\/\/ Check if firebase is actually configured[\s\S]*?const isValidConfig = firebaseConfig && firebaseConfig\.apiKey;/,
  `import firebaseConfig from '../../firebase-applet-config.json';
const isValidConfig = firebaseConfig && firebaseConfig.apiKey;`
);

fs.writeFileSync('src/lib/firebase.ts', code);
