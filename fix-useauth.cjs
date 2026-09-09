const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAuth.ts', 'utf8');

code = code.replace(
  /const unsubscribe = auth\.onAuthStateChanged\(\(user\) => \{/,
  `if (!auth) { setLoading(false); return; }\n    const unsubscribe = auth.onAuthStateChanged((user) => {`
);

fs.writeFileSync('src/hooks/useAuth.ts', code);
