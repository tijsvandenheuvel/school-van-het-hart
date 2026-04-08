const path = require('node:path');
const { generateImage } = require('./openai-image-module');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_REFERENCE_PATH = path.join(ROOT_DIR, 'assets', 'design-example.jpeg');
const DEFAULT_OUTPUT_PATH = path.join(ROOT_DIR, 'output', 'corner-studies', 'top-left-corner-study-v1.png');

function parseArgs(argv) {
  const options = {
    outputPath: DEFAULT_OUTPUT_PATH,
    referencePath: DEFAULT_REFERENCE_PATH,
    dryRun: false,
    model: process.env.OPENAI_TEXT_MODEL || 'gpt-5',
    size: '1024x1024',
    quality: 'high',
    background: 'transparent',
    extraPrompt: ''
  };

  argv.forEach((arg) => {
    if (arg === '--dry-run') {
      options.dryRun = true;
      return;
    }

    if (arg.startsWith('--output=')) {
      options.outputPath = path.resolve(arg.slice('--output='.length));
      return;
    }

    if (arg.startsWith('--reference=')) {
      options.referencePath = path.resolve(arg.slice('--reference='.length));
      return;
    }

    if (arg.startsWith('--model=')) {
      options.model = arg.slice('--model='.length).trim() || options.model;
      return;
    }

    if (arg.startsWith('--size=')) {
      options.size = arg.slice('--size='.length).trim() || options.size;
      return;
    }

    if (arg.startsWith('--quality=')) {
      options.quality = arg.slice('--quality='.length).trim() || options.quality;
      return;
    }

    if (arg.startsWith('--background=')) {
      options.background = arg.slice('--background='.length).trim() || options.background;
      return;
    }

    if (arg.startsWith('--extra-prompt=')) {
      options.extraPrompt = arg.slice('--extra-prompt='.length).trim();
    }
  });

  return options;
}

function buildCornerPrompt(extraPrompt) {
  const lines = [
    'Use case: stylized-concept',
    'Asset type: ornamental website corner study',
    'Primary request: generate a single top-left ornamental page corner for the School van het Hart website.',
    'Input images: Image 1 is a style and mood reference for sacred poster ornament, gold line rhythm, corner framing, and pink heart medallions.',
    'Scene/backdrop: transparent background only; no poster, no landscape, no full frame.',
    'Subject: one elegant top-left corner ornament with an integrated heart medallion, antique gold linework, one dominant sweeping quarter-arc, one or two restrained curls, and a refined border attachment along the top and left edges.',
    'Style/medium: art nouveau inspired storybook ornament, clean polished illustration, crisp silhouette, finished edges, simple and graceful rather than busy.',
    'Composition/framing: square crop, ornament anchored tightly to the top-left, negative space opening toward the center of the page.',
    'Lighting/mood: warm luminous gold with subtle enamel highlights, soft sacred calm, no harsh shadows.',
    'Color palette: antique gold, pale cream highlights, blush pink heart, very subtle cool reflection only if needed.',
    'Materials/textures: gilded metal linework, smooth enamel medallion, delicate handcrafted finish.',
    'Constraints: simple, beautiful, readable at small website scale; transparent background; no rainbow; no butterflies; no extra symbols; no text; no poster fragments; no scenery; no muddy glow; no watermark.'
  ];

  if (extraPrompt) {
    lines.push(`Additional direction: ${extraPrompt}`);
  }

  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const prompt = buildCornerPrompt(options.extraPrompt);
  const metadataPath = `${options.outputPath.replace(/\.(png|webp|jpg|jpeg)$/i, '')}.json`;

  if (options.dryRun) {
    console.log(JSON.stringify({
      outputPath: options.outputPath,
      metadataPath,
      referencePath: options.referencePath,
      model: options.model,
      size: options.size,
      quality: options.quality,
      background: options.background,
      prompt
    }, null, 2));
    return;
  }

  const result = await generateImage({
    prompt,
    model: options.model,
    size: options.size,
    quality: options.quality,
    background: options.background,
    referencePaths: [options.referencePath],
    outputPath: options.outputPath,
    metadataPath
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
