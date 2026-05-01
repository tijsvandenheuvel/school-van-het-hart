const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const html = read('index.html');
const siteJs = read('assets/js/site.js');
const changelog = read('docs/changelog.md');
const concepts = read('docs/concepts.md');
const uiGuidelines = read('docs/ui-guidelines.md');
const projectContext = read('docs/project-context.md');
const packageJson = JSON.parse(read('package.json'));
const currentVersion = 'v0.3.31';

function extractNumber(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*(-?\\d+(?:\\.\\d+)?)`));
  assert.ok(match, `Missing ${key} in ORBIT_GEOMETRY`);
  return Number(match[1]);
}

assert.match(changelog, /^## v0\.3\.7 - Verticale scanpassing/m);
assert.equal(packageJson.version, currentVersion.slice(1));
assert.match(html, new RegExp(`id="versionTrigger"[^>]*>${currentVersion}<\\/button>`));
assert.match(html, /id="flowerOfLife"/);
assert.match(html, /class="flower-of-life-layer"/);

assert.match(siteJs, /const ORBIT_GEOMETRY = \{/);
assert.equal(extractNumber(siteJs, 'ringStartAngle'), -75);
assert.equal(extractNumber(siteJs, 'ringStepAngle'), 30);
assert.equal(extractNumber(siteJs, 'visibleTokenCount'), 12);
assert.match(siteJs, /function getTokenAngle\(index\)/);
assert.match(siteJs, /function renderFlowerOfLife\(\)/);
assert.match(siteJs, /function syncFlowerOfLifeScale\(/);
assert.match(siteJs, /flowerOuterRingRadiusRatio/);
assert.match(siteJs, /radius - tokenRadius/);
assert.match(siteJs, /offsetWidth/);
assert.match(siteJs, /renderFlowerOfLife\(\);\s*\n\s*syncTokenLayout\(\);/);
assert.match(siteJs, /window\.requestAnimationFrame\(scheduleTokenLayout\)/);
assert.match(siteJs, /window\.addEventListener\('load', syncTokenLayout, \{ once: true \}\)/);
assert.doesNotMatch(siteJs, /tokens\[0\]\.button\.getBoundingClientRect\(\)\.width/);
assert.doesNotMatch(siteJs, /angleMobile/);

const documentedAngles = [...concepts.matchAll(/Geometry angle: `(-?\d+)`/g)].map((match) => Number(match[1]));
assert.deepEqual(
  documentedAngles,
  [-75, -45, -15, 15, 45, 75, 105, 135, 165, 195, 225, 255]
);
assert.doesNotMatch(concepts, /Desktop angle|Compact mobile angle/);
assert.match(concepts, new RegExp(currentVersion));
assert.match(uiGuidelines, /exacte 12-delige geometrische ring/);
assert.match(uiGuidelines, new RegExp(currentVersion));
assert.match(projectContext, new RegExp(currentVersion));

const tokenCssMatch = html.match(/\.token\s*\{[\s\S]*?\n\s*\}/);
assert.ok(tokenCssMatch, 'Missing .token CSS block');
assert.match(tokenCssMatch[0], /aspect-ratio:\s*1\s*\/\s*1/);
assert.match(tokenCssMatch[0], /border-radius:\s*50%/);
assert.match(tokenCssMatch[0], /translate3d\(-50%,\s*-50%,\s*0\)/);
assert.match(tokenCssMatch[0], /will-change:\s*transform/);
assert.match(html, /\.heart-wrap\s*\{[\s\S]*?translateZ\(0\)/);
assert.match(html, /\.flower-of-life-layer\s*\{[\s\S]*?translate3d\(-50%,\s*-50%,\s*0\)/);
assert.match(html, /--orbit-touch-ratio:\s*0\.517638/);
assert.match(html, /--orbit-fit-ratio:\s*0\.397321/);
assert.match(html, /--composition-size:\s*min\(1120px,/);
assert.match(html, /--token-size:\s*calc\(var\(--orbit-radius\)\s*\*\s*var\(--orbit-touch-ratio\)\)/);
assert.match(tokenCssMatch[0], /width:\s*var\(--token-size\)/);
assert.match(tokenCssMatch[0], /font-size:\s*clamp\(0\.48rem,\s*calc\(var\(--token-size\)\s*\*\s*0\.08\),\s*1\.08rem\)/);
assert.doesNotMatch(html, /\.token\s*\{[\s\S]*?font-size:\s*0\.(?:78|84)rem/);
assert.doesNotMatch(html, /\.token\s*\{[\s\S]*?font-size:\s*clamp\(0\.46rem/);
const tokenHoverCssMatch = html.match(/\.token:hover,\s*\n\s*\.token:focus-visible\s*\{[^}]*\}/);
assert.ok(tokenHoverCssMatch, 'Missing .token hover CSS block');
assert.doesNotMatch(tokenHoverCssMatch[0], /--token-scale:\s*1\.(?:0[1-9]|[1-9])/);
assert.doesNotMatch(tokenHoverCssMatch[0], /box-shadow:/);
assert.doesNotMatch(html, /\.core-axis\s*\{[\s\S]*?transform:\s*translateY\(8px\)/);

console.log('Flower geometry source checks passed.');
