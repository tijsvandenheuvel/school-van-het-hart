const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-5';

const MIME_TYPES = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

function resolveMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return MIME_TYPES[extension] || null;
}

async function encodeImageAsDataUrl(filePath) {
  const mimeType = resolveMimeType(filePath);

  if (!mimeType) {
    throw new Error(`Niet-ondersteund referentiebeeldformaat voor ${filePath}. Gebruik png, jpg, jpeg of webp.`);
  }

  const buffer = await fs.readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function extractImageGenerationCall(responsePayload) {
  return (responsePayload.output || []).find((entry) => entry.type === 'image_generation_call' && entry.result);
}

function buildRequestBody(options) {
  const {
    prompt,
    referenceDataUrls,
    model = DEFAULT_MODEL,
    size = '1024x1024',
    quality = 'high',
    background = 'transparent',
    inputFidelity
  } = options;

  const content = [{ type: 'input_text', text: prompt }];

  referenceDataUrls.forEach((imageUrl) => {
    content.push({
      type: 'input_image',
      image_url: imageUrl
    });
  });

  const tool = {
    type: 'image_generation',
    size,
    quality,
    background
  };

  if (inputFidelity) {
    tool.input_fidelity = inputFidelity;
  }

  return {
    model,
    input: [
      {
        role: 'user',
        content
      }
    ],
    tools: [tool]
  };
}

async function writeGenerationArtifacts(outputPath, metadataPath, imageBuffer, metadata) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, imageBuffer);

  if (metadataPath) {
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  }
}

async function generateImage(options) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const apiBase = options.apiBase || process.env.OPENAI_API_BASE_URL || DEFAULT_API_BASE;
  const referencePaths = Array.isArray(options.referencePaths) ? options.referencePaths : [];

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ontbreekt. Exporteer eerst een geldige API-key om beeldgeneratie uit te voeren.');
  }

  if (!options.prompt || !options.prompt.trim()) {
    throw new Error('Er is een niet-lege prompt nodig om een beeld te genereren.');
  }

  if (!options.outputPath) {
    throw new Error('Er is een outputPath nodig om het gegenereerde beeld weg te schrijven.');
  }

  const referenceDataUrls = await Promise.all(referencePaths.map((filePath) => encodeImageAsDataUrl(filePath)));
  const requestBody = buildRequestBody({
    prompt: options.prompt.trim(),
    referenceDataUrls,
    model: options.model,
    size: options.size,
    quality: options.quality,
    background: options.background,
    inputFidelity: options.inputFidelity || (referenceDataUrls.length ? 'high' : undefined)
  });

  const response = await fetch(`${apiBase}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI image request faalde (${response.status} ${response.statusText}): ${errorBody}`);
  }

  const payload = await response.json();
  const imageCall = extractImageGenerationCall(payload);

  if (!imageCall) {
    throw new Error('Geen image_generation_call in de OpenAI-respons gevonden.');
  }

  const outputPath = path.resolve(options.outputPath);
  const metadataPath = options.metadataPath ? path.resolve(options.metadataPath) : `${outputPath}.json`;
  const metadata = {
    generatedAt: new Date().toISOString(),
    model: requestBody.model,
    prompt: options.prompt.trim(),
    revisedPrompt: imageCall.revised_prompt || null,
    outputPath,
    referencePaths: referencePaths.map((filePath) => path.resolve(filePath)),
    request: requestBody,
    responseId: payload.id || null
  };

  await writeGenerationArtifacts(
    outputPath,
    metadataPath,
    Buffer.from(imageCall.result, 'base64'),
    metadata
  );

  return {
    outputPath,
    metadataPath,
    responseId: payload.id || null,
    revisedPrompt: imageCall.revised_prompt || null
  };
}

module.exports = {
  buildRequestBody,
  encodeImageAsDataUrl,
  extractImageGenerationCall,
  generateImage
};
