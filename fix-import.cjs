const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  /import \{ (.*?) \} from "lucide-react";/,
  `import { $1, Minus, Square } from "lucide-react";`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Fixed lucide-react import!");
