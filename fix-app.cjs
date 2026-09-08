const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix PlayerBar call
code = code.replace(
  /<PlayerBar onOpenSettings=\{\(\) => setIsSettingsOpen\(true\)\} \/>/,
  '<PlayerBar />'
);

// Increase PlayerBar height
code = code.replace(
  /className="h-24 bg-zinc-950 border-t border-white\/5 z-50 flex-shrink-0"/,
  'className="h-28 bg-zinc-950 border-t border-white/5 z-50 flex-shrink-0 shadow-2xl"'
);

// Fix profile picture
code = code.replace(
  /<div className="w-8 h-8 rounded-sm bg-white\/10 flex items-center justify-center flex-shrink-0">\s*<User className="w-4 h-4 text-white" \/>\s*<\/div>/,
  `{user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-sm flex-shrink-0 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx updated!");
