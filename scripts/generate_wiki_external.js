const path = require('node:path');

const {
  readVisibleExternalEntries,
  generateAllExternalContexts
} = require(path.join(__dirname, '..', 'server', 'wiki-external.js'));

async function main() {
  const forceRefresh = process.argv.includes('--refresh');
  const entries = await readVisibleExternalEntries();
  const contexts = await generateAllExternalContexts({ entries, preferCache: !forceRefresh, persist: true });
  const ready = contexts.filter((context) => context.status === 'ready').length;
  const unresolved = contexts.filter((context) => context.status !== 'ready').length;

  console.log(`Externe wiki-context gegenereerd voor ${contexts.length} ingangen.`);
  console.log(`- Klaar: ${ready}`);
  console.log(`- Onopgelost: ${unresolved}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
