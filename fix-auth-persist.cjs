const fs = require('fs');
let fbStr = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Replace imports to include setPersistence and browserLocalPersistence
fbStr = fbStr.replace(
  /import \{ getAuth, GoogleAuthProvider, signInWithPopup, signOut \} from 'firebase\/auth';/,
  `import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';`
);

// Explicitly set persistence
fbStr = fbStr.replace(
  /export const auth = getAuth\(app\);/,
  `export const auth = getAuth(app);\nsetPersistence(auth, browserLocalPersistence).catch(console.error);`
);

fs.writeFileSync('src/lib/firebase.ts', fbStr);
console.log("Firebase persistence fixed!");
