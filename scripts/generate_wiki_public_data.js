const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ITEMS_DIR = path.join(ROOT_DIR, 'wiki', 'items');
const CURATED_INDEX_PATH = path.join(ROOT_DIR, 'wiki', 'meta', 'curated-index.md');
const OUTPUT_PATH = path.join(ROOT_DIR, 'wiki', 'generated', 'public-wiki-items.json');

const Core = require(path.join(ROOT_DIR, 'assets', 'js', 'wiki-core.js'));

async function main() {
  const itemNames = (await fs.readdir(ITEMS_DIR))
    .filter((name) => name.endsWith('.md'))
    .sort();

  const rawItems = await Promise.all(
    itemNames.map(async (name) => {
      const absolutePath = path.join(ITEMS_DIR, name);
      const markdown = await fs.readFile(absolutePath, 'utf8');
      return Core.parseItemMarkdown(markdown, path.relative(ROOT_DIR, absolutePath).replace(/\\/g, '/'));
    })
  );

  const curatedMarkdown = await fs.readFile(CURATED_INDEX_PATH, 'utf8');
  const curatedTargets = Core.parseCuratedIndexMarkdown(curatedMarkdown);
  const wikiIndex = Core.buildWikiIndex(rawItems, { curatedTargets });

  const payload = {
    generatedAt: new Date().toISOString(),
    curatedTargets,
    stats: wikiIndex.stats,
    items: wikiIndex.order
      .map((slug) => wikiIndex.bySlug[slug])
      .filter(Boolean)
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        links: Array.isArray(item.links) ? item.links : [],
        body: item.body,
        filePath: item.filePath || '',
        kind: 'canonical',
        indexType: 'word',
        resolveAsTerm: true
      }))
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${payload.items.length} canonical wiki items to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
