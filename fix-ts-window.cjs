const fs = require('fs');

const typesCode = fs.readFileSync('src/types.ts', 'utf8');
if (!typesCode.includes('declare global')) {
  fs.writeFileSync('src/types.ts', typesCode + `\n\ndeclare global {\n  interface Window {\n    electron?: {\n      minimize: () => void;\n      maximize: () => void;\n      close: () => void;\n    };\n  }\n}\n`);
}
