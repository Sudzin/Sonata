const fs = require('fs');
let code = fs.readFileSync('src/components/Library.tsx', 'utf-8');

// Remove AlertCircle import
code = code.replace(', AlertCircle', '');

// Remove states
code = code.replace(/  const \[dirHandle, setDirHandle\] = useState<FileSystemDirectoryHandle \| null>\(null\);\n/, '');
code = code.replace(/  const \[needsPermission, setNeedsPermission\] = useState\(false\);\n/, '');

// Remove useEffect and restoreAccess
code = code.replace(/  useEffect\(\(\) => \{\n    \/\/ Legacy support removal, we no longer check permissions via handle\n    \/\/ The main process handles all fs permissions natively\n  \}, \[\]\);\n\n  const restoreAccess = async \(\) => \{\n    \/\/ Deprecated for Native FS\n  \};\n/, '');

// Remove setNeedsPermission in handleSelectFolder
code = code.replace(/      setNeedsPermission\(false\);\n/, '');

// Remove yellow banner
code = code.replace(/      \{needsPermission && library\.length > 0 && \(\n        <div className="bg-amber-500\/10 border border-amber-500\/50 rounded-xl p-4 mb-8 flex items-center justify-between">\n          <div className="flex items-center gap-3 text-amber-200">\n            <AlertCircle className="w-5 h-5" \/>\n            <span className="text-sm font-medium">Please restore access to your music folder to play tracks\.<\/span>\n          <\/div>\n          <button \n            onClick=\{restoreAccess\}\n            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg text-sm transition-colors"\n          >\n            Restore Access\n          <\/button>\n        <\/div>\n      \)\}\n/, '');

fs.writeFileSync('src/components/Library.tsx', code);
