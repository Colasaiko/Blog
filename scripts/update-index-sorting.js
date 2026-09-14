import fs from 'fs';

let content = fs.readFileSync('src/pages/index.astro', 'utf8');

// The original logic sorts purely by date:
// const posts = (await getCollection('blog')).sort(
//    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
// );

// We change it to prioritize airports, brands, clash, nodes, then fallback to date:
const newSortLogic = `
const allPosts = await getCollection('blog');
const priorityKeywords = ['机场', '评测', 'Clash', '线路', '节点', '稳定'];

const posts = allPosts.sort((a, b) => {
  const aTitle = a.data.title || '';
  const bTitle = b.data.title || '';
  
  const aIsPriority = priorityKeywords.some(kw => aTitle.includes(kw));
  const bIsPriority = priorityKeywords.some(kw => bTitle.includes(kw));

  // If one is priority and the other is not, the priority one comes first
  if (aIsPriority && !bIsPriority) return -1;
  if (!aIsPriority && bIsPriority) return 1;

  // Otherwise fallback to date
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
});
`;

content = content.replace(/const posts = \(await getCollection\('blog'\)\)\.sort\([\s\S]*?\);/, newSortLogic.trim());

fs.writeFileSync('src/pages/index.astro', content);
console.log('Homepage post prioritization updated.');
