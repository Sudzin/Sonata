const fs = require('fs');

let agentsStr = fs.readFileSync('AGENTS.md', 'utf8');

// Update the agents rule to reflect the new behavior
agentsStr = agentsStr.replace(
  /- Правая боковая панель с деталями трека должна отображаться ВСЕГДА \(даже если трек не играет, показываем заглушку на черном фоне, чтобы она занимала то же самое место\)\./g,
  '- Правая боковая панель с деталями трека должна отображаться ТОЛЬКО когда играет трек (currentTrack != null). Если трек не играет, этой панели быть не должно (ширина центрального контента должна растягиваться).'
);

fs.writeFileSync('AGENTS.md', agentsStr);
console.log("AGENTS.md updated!");
