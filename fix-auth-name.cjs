const fs = require('fs');

let fbStr = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Replace the Google Auth provider to explicitly request only the profile and email,
// avoiding weird ID strings in the display name.
fbStr = fbStr.replace(
  /export const googleProvider = new GoogleAuthProvider\(\);/,
  `export const googleProvider = new GoogleAuthProvider();\ngoogleProvider.setCustomParameters({ prompt: 'select_account' });`
);

fs.writeFileSync('src/lib/firebase.ts', fbStr);

let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(
  /user\s*\?\s*\(user\.displayName\s*\|\|\s*user\.email\?\`\.split\('@'\)\[0\]\)\s*:\s*t\.guest/,
  `user ? (user.displayName || user.email?.split('@')[0]) : t.guest`
);
fs.writeFileSync('src/App.tsx', appStr);

console.log("Firebase Provider configured");
