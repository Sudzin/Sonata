const fs = require('fs');

let i18nStr = fs.readFileSync('src/i18n.ts', 'utf8');

i18nStr = i18nStr.replace(/time:\s*"Время"/g, 'time: "Длительность"');
i18nStr = i18nStr.replace(/artist:\s*"Артист"/g, 'artist: "Исполнитель"');

// Add new keys if missing
if (!i18nStr.includes('album:')) {
  i18nStr = i18nStr.replace(
    /time: "Длительность",/g, 
    'time: "Длительность",\n    album: "Альбом",\n    genre: "Жанр",\n    duration: "Длительность",'
  );
  i18nStr = i18nStr.replace(
    /time: "Time",/g, 
    'time: "Time",\n    album: "Album",\n    genre: "Genre",\n    duration: "Duration",'
  );
}

fs.writeFileSync('src/i18n.ts', i18nStr);
console.log("i18n updated!");
