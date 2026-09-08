const fs = require('fs');

let serverStr = fs.readFileSync('server.ts', 'utf8');

// 1. Remove top-level import
serverStr = serverStr.replace(/import \{ createServer as createViteServer \} from "vite";\n?/g, '');
serverStr = serverStr.replace(/import \{ createServer as createViteServer \} from "vite";/g, '');

// 2. Add dynamic import inside the dev block
serverStr = serverStr.replace(
  /const vite = await createViteServer\(\{/g,
  `const { createServer: createViteServer } = await import("vite");\n    const vite = await createViteServer({`
);

fs.writeFileSync('server.ts', serverStr);
console.log("Vite dynamic import fixed!");
