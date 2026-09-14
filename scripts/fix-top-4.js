import fs from 'fs';

let content = fs.readFileSync('src/content/blog/top-4-recommended-airports.md', 'utf8');
content = content.replace(/title: ".*"/, 'title: "2026四大优质机场精选：高分节点与真实体验评测"');
fs.writeFileSync('src/content/blog/top-4-recommended-airports.md', content);
console.log('Fixed top-4 title');
