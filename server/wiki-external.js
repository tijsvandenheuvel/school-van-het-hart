const fs = require('node:fs/promises');
const path = require('node:path');

require(path.join(__dirname, '..', 'assets/js/wiki-core.js'));

const Core = globalThis.SVHHWikiCore;
const ROOT_DIR = path.resolve(__dirname, '..');
const ITEMS_DIR = path.join(ROOT_DIR, 'wiki', 'items');
const SOURCE_CATALOG_PATH = path.join(ROOT_DIR, 'wiki', 'meta', 'source-catalog.json');
const IGNORED_TERMS_PATH = path.join(ROOT_DIR, 'wiki', 'meta', 'ignored-terms.md');
const GENERATED_DIR = path.join(ROOT_DIR, 'wiki', 'generated', 'external');
const USER_AGENT = 'SchoolVanHetHartWikiBot/0.1 (local development external vocabulary context)';
const RESPONSE_CACHE = new Map();
const collator = new Intl.Collator('nl', { sensitivity: 'base' });
const ALIAS_CONNECTOR_WORDS = new Set(['en']);
const SOURCE_TERM_STOPWORDS = new Set([
  'aan', 'aarde', 'achter', 'alle', 'alleen', 'allerlei', 'als', 'alsof', 'altijd',
  'andere', 'beetje', 'belangrijk', 'bepaalde', 'beter', 'bij', 'binnen', 'bron',
  'bronnen', 'bronpassage', 'bronpassages', 'brontekst', 'bronteksten', 'bruikbaar',
  'buiten', 'but', 'daar', 'daarom', 'daarvoor', 'dan', 'dat', 'de', 'dezelfde', 'den',
  'der', 'des', 'deze', 'die', 'dit', 'doen', 'door', 'duurt', 'dus', 'een', 'eens',
  'eigen', 'eigenlijk', 'eerste', 'elk', 'en', 'enough', 'er', 'eraan', 'ervaring',
  'everybody', 'everyone', 'everyones', 'family', 'financieel', 'for', 'gaan', 'geen',
  'geld', 'genoeg', 'gewoon', 'great', 'groep', 'groot', 'grote', 'haar', 'hart',
  'hebben', 'heeft', 'heel', 'hele', 'hem', 'het', 'hier', 'hierbij', 'hieruit', 'hoe',
  'home', 'hun', 'ieder', 'iedere', 'iedereen', 'iemand', 'iets', 'immers', 'in',
  'intern', 'is', 'kan', 'ken', 'kleine', 'komen', 'kunnen', 'krijgt', 'lang', 'leren',
  'light', 'living', 'mag', 'maken', 'maar', 'meer', 'mekaar', 'men', 'met', 'mij',
  'mijn', 'moet', 'naar', 'need', 'nemen', 'niemand', 'nieuwe', 'niet', 'nodig', 'nog',
  'not', 'nu', 'of', 'om', 'ons', 'onze', 'ook', 'ontvangt', 'op', 'open', 'over',
  'pagina', 'passage', 'people', 'plek', 'praktijk', 'project', 'ruimte', 'safe',
  'samen', 'school', 'sectie', 'soort', 'space', 'spirit', 'staat', 'stek', 'teksten',
  'term', 'termen', 'tenzij', 'the', 'there', 'toch', 'tot', 'tussen', 'uit', 'van',
  'veel', 'verder', 'voor', 'waar', 'waarin', 'ware', 'waarom', 'was', 'wat', 'we',
  'weer', 'wel', 'welke', 'wereld', 'werd', 'weten', 'worden', 'wordt', 'woorden',
  'zal', 'ze', 'zelf', 'zien', 'zich', 'zijn', 'zij', 'zo', 'zoals', 'zodat'
]);
const SOURCE_CONCEPT_DEFINITIONS = [
  {
    title: 'Ambacht',
    summary: 'Het vaardige maken met handen, materiaal, aandacht en verantwoordelijkheid.',
    variants: ['ambacht', 'ambachten', 'stiel', 'stielen'],
    links: ['Ambachtelijk', 'Spel & creativiteit', 'Gedachtelijk'],
    paragraphs: [
      'Ambacht benoemt het concrete maken: werken met handen, materialen, ritme en zorg. Binnen de School van het Hart hoort het bij de praktijklaag van spel, creativiteit, bouwen, herstellen en leren door te doen.',
      'Als bronbegrip staat ambacht niet los van gedachte. Wat met de handen gemaakt wordt, krijgt richting door innerlijke ordening, aandacht en bedoeling.'
    ]
  },
  {
    title: 'Ambachtelijk',
    summary: 'De houding waarin maken aandachtig, lichamelijk en betekenisvol wordt.',
    variants: ['ambachtelijk', 'ambachtelijke'],
    links: ['Ambacht', 'Gedachtelijk', 'Spel & creativiteit'],
    paragraphs: [
      'Ambachtelijk wijst op een manier van werken waarin handeling, aandacht en materiaal samenkomen. Het gaat niet alleen om techniek, maar om zorgvuldigheid, belichaming en verantwoordelijkheid in het maken.',
      'In de taalbewuste bronlaag raakt ambachtelijk aan gedachtelijk: wat we maken en wat we denken horen bij elkaar wanneer de vorm uit het hart en uit heldere aandacht voortkomt.'
    ]
  },
  {
    title: 'Gedachte',
    summary: 'De innerlijke vormkracht waarmee taal, beeld en handelen richting krijgen.',
    variants: ['gedachte', 'gedachten', 'gedachtenbeeld', 'welkomsgedachte'],
    links: ['Gedachtelijk', 'Taalbewustzijn', 'Ambachtelijk'],
    paragraphs: [
      'Gedachte is de innerlijke beweging waarin betekenis vorm krijgt voordat ze gesproken, geschreven of gedaan wordt. In het taalbewustzijn is denken daarom niet los te maken van spreken, luisteren en handelen.',
      'Een gedachte kan verwarren wanneer ze onbewust blijft, maar kan ook ordenen wanneer ze helder wordt en in verbinding met het hart wordt gebracht.'
    ]
  },
  {
    title: 'Gedachtelijk',
    summary: 'De geestelijke of innerlijke laag waarin betekenis voorbereid en geordend wordt.',
    variants: ['gedachtelijk', 'gedachtelijke'],
    links: ['Gedachte', 'Ambachtelijk', 'Taalbewustzijn'],
    paragraphs: [
      'Gedachtelijk verwijst naar wat zich in de innerlijke vorming, betekenisgeving en verbeelding afspeelt. Het benoemt de laag waarin woorden, beelden en intenties zich eerst organiseren.',
      'Samen met ambachtelijk maakt dit zichtbaar dat de School van het Hart niet alleen praktisch of alleen geestelijk werkt: het gedachte en het gemaakte moeten elkaar dragen.'
    ]
  }
];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function timeoutAfter(milliseconds, label = 'operatie') {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout na ${milliseconds}ms tijdens ${label}`));
    }, milliseconds);
  });
}

function buildWikiUrl(host, key) {
  const safeKey = String(key || '').replace(/ /g, '_');
  return `https://${host}/wiki/${encodeURI(safeKey).replace(/%2F/g, '/')}`;
}

function compressWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function formatLemmaTitle(value) {
  const cleaned = compressWhitespace(value);
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function buildTermVariantKeys(normalized) {
  const cleaned = Core.normalizeTerm(normalized);
  if (!cleaned) return [];

  const variants = new Set([cleaned]);
  const parts = cleaned.split(' ');
  const last = parts[parts.length - 1];

  function addLastVariant(nextLast) {
    if (!nextLast || nextLast === last) return;
    variants.add([...parts.slice(0, -1), nextLast].join(' '));
  }

  if (last.length > 4 && last.endsWith('s') && !last.endsWith('ss')) {
    addLastVariant(last.slice(0, -1));
  }
  if (last.length > 5 && last.endsWith('en')) {
    addLastVariant(last.slice(0, -2));
  }
  if (last.length > 5 && last.endsWith('ies')) {
    addLastVariant(`${last.slice(0, -3)}ie`);
  }
  if (last.length > 3 && !last.endsWith('s')) {
    addLastVariant(`${last}s`);
  }
  if (last.length > 3 && !last.endsWith('en')) {
    addLastVariant(`${last}en`);
  }

  return [...variants];
}

function uniqueTerms(values) {
  const seen = new Set();
  const list = [];
  (values || []).forEach((value) => {
    if (!value) return;
    const normalized = Core.normalizeTerm(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    list.push(String(value).trim());
  });
  return list;
}

function formatWikiLinkSeries(titles) {
  const cleaned = uniqueTerms(titles).filter(Boolean);
  if (!cleaned.length) return '';
  if (cleaned.length === 1) return `[[${cleaned[0]}]]`;
  if (cleaned.length === 2) return `[[${cleaned[0]}]] en [[${cleaned[1]}]]`;
  const head = cleaned.slice(0, -1).map((title) => `[[${title}]]`).join(', ');
  return `${head} en [[${cleaned[cleaned.length - 1]}]]`;
}

function normalizeAliasDisplayKey(value) {
  return Core.normalizeTerm(value)
    .split(' ')
    .filter((part) => part && !ALIAS_CONNECTOR_WORDS.has(part))
    .join(' ');
}

function isAliasOnlyTitleVariant(alias, title) {
  const aliasKey = normalizeAliasDisplayKey(alias);
  const titleKey = normalizeAliasDisplayKey(title);
  return Boolean(aliasKey && titleKey && aliasKey === titleKey);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildVariantKeys(value) {
  const normalized = Core.normalizeTerm(value);
  const variants = new Set();

  function singularize(token) {
    if (token.length > 5 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
    if (token.length > 5 && token.endsWith('en')) return token.slice(0, -2);
    if (token.length > 4 && token.endsWith('s')) return token.slice(0, -1);
    return token;
  }

  if (normalized) {
    variants.add(normalized);
    const singular = normalized
      .split(' ')
      .filter(Boolean)
      .map((token) => singularize(token))
      .join(' ')
      .trim();
    if (singular) variants.add(singular);
  }

  return variants;
}

function stripBalanced(source, opener, closer) {
  const text = String(source || '');
  if (!text.includes(opener)) return text;

  let result = '';
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text.startsWith(opener, index)) {
      depth += 1;
      index += opener.length - 1;
      continue;
    }

    if (depth > 0 && text.startsWith(closer, index)) {
      depth = Math.max(0, depth - 1);
      index += closer.length - 1;
      continue;
    }

    if (depth === 0) {
      result += text[index];
    }
  }

  return result;
}

function stripMarkdownForExtraction(markdown, title = '') {
  return Core.stripLeadingTitleHeading(String(markdown || ''), title)
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => ` ${label || target} `)
    .replace(/`([^`]+)`/g, ' $1 ')
    .replace(/[*_>#~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSourceText(text) {
  return [...String(text || '').matchAll(/[\p{L}\p{N}][\p{L}\p{N}&'’-]*/gu)].map((match) => ({
    value: match[0],
    normalized: Core.normalizeTerm(match[0])
  })).filter((token) => token.normalized);
}

function isUsefulSourceToken(token, minimumLength = 4) {
  if (!token || token.length < minimumLength) return false;
  if (SOURCE_TERM_STOPWORDS.has(token)) return false;
  if (/^\d+$/.test(token)) return false;
  if (/^[ivxlcdm]+$/i.test(token)) return false;
  if (/(.)\1{2,}/.test(token)) return false;
  if (minimumLength >= 4 && !/[aeiouy]/.test(token)) return false;
  return true;
}

function buildTermEntries(items) {
  const rawEntries = [];

  items.forEach((item) => {
    if (item.resolveAsTerm === false) return;
    [item.title, ...(item.links || [])].forEach((term) => {
      const normalized = Core.normalizeTerm(term);
      if (!normalized) return;
      rawEntries.push({
        term,
        normalized,
        slug: item.slug,
        title: item.title
      });
    });
  });

  rawEntries.sort((left, right) => {
    const leftLength = left.normalized.length;
    const rightLength = right.normalized.length;
    if (leftLength !== rightLength) return rightLength - leftLength;
    return collator.compare(left.term, right.term);
  });

  const seen = new Set();
  return rawEntries.filter((entry) => {
    if (seen.has(entry.normalized)) return false;
    seen.add(entry.normalized);
    return true;
  });
}

function findTermMatches(text, termEntries, excludeSlug = '') {
  const matches = [];

  (termEntries || []).forEach((entry) => {
    if (excludeSlug && entry.slug === excludeSlug) return;

    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(entry.term)})(?=$|[^\\p{L}\\p{N}])`, 'giu');
    let match;

    while ((match = pattern.exec(text))) {
      const start = match.index + match[1].length;
      const end = start + match[2].length;
      matches.push({
        start,
        end,
        text: match[2],
        slug: entry.slug
      });

      if (pattern.lastIndex === match.index) pattern.lastIndex += 1;
    }
  });

  matches.sort((left, right) => {
    if (left.start !== right.start) return left.start - right.start;
    return (right.end - right.start) - (left.end - left.start);
  });

  const filtered = [];
  matches.forEach((match) => {
    const previous = filtered[filtered.length - 1];
    if (!previous || match.start >= previous.end) {
      filtered.push(match);
    } else if (match.start === previous.start && match.end > previous.end) {
      filtered[filtered.length - 1] = match;
    }
  });

  return filtered;
}

function collectOutgoingLinks(item, termEntries) {
  const outgoing = new Map();

  String(item.body || '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target) => {
    const normalized = Core.normalizeTerm(String(target || '').trim());
    const resolved = (termEntries || []).find((entry) => entry.normalized === normalized);
    if (resolved && resolved.slug !== item.slug && !outgoing.has(resolved.slug)) {
      outgoing.set(resolved.slug, true);
    }
    return _;
  });

  findTermMatches(item.body, termEntries, item.slug).forEach((match) => {
    if (!outgoing.has(match.slug)) outgoing.set(match.slug, true);
  });

  return [...outgoing.keys()];
}

function buildSyntheticTermItems(canonicalItems, outgoingBySlug) {
  const representedTerms = new Set(canonicalItems.map((item) => Core.normalizeTerm(item.title)));
  const usedSlugs = new Set(canonicalItems.map((item) => item.slug));
  const syntheticItems = [];

  canonicalItems.forEach((item) => {
    (item.links || []).forEach((alias) => {
      const normalized = Core.normalizeTerm(alias);
      if (
        !normalized ||
        normalized === Core.normalizeTerm(item.title) ||
        isAliasOnlyTitleVariant(alias, item.title) ||
        representedTerms.has(normalized)
      ) return;

      representedTerms.add(normalized);

      const slugBase = Core.slugify(alias);
      let slug = slugBase;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }
      usedSlugs.add(slug);

      syntheticItems.push({
        slug,
        title: String(alias).trim(),
        links: [],
        body: '',
        kind: 'term',
        sourceSlug: item.slug,
        indexType: 'word',
        resolveAsTerm: true,
        summary: `Letterlijke woordenboekingang uit de bronteksten. Zie vooral ${item.title}.`,
        outgoing: outgoingBySlug.get(item.slug) || []
      });
    });
  });

  return syntheticItems;
}

function matchesNormalizedPhrase(normalizedText, normalizedPhrase) {
  if (!normalizedText || !normalizedPhrase) return false;
  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

function collectSourceConceptEvidence(definition, sourceEntries, sourceTitlesBySlug) {
  const variants = uniqueTerms([definition.title, ...(definition.variants || [])])
    .map((term) => Core.normalizeTerm(term))
    .filter(Boolean);
  const sources = new Map();
  const snippets = [];

  sourceEntries
    .filter((entry) => entry.indexType === 'passage')
    .forEach((entry) => {
      const text = stripMarkdownForExtraction(entry.body, entry.title)
        .replace(/\s*Bron:\s.*$/i, '')
        .trim();
      const normalizedText = Core.normalizeTerm(text);
      const hasMatch = variants.some((variant) => matchesNormalizedPhrase(normalizedText, variant));
      if (!hasMatch) return;

      const sourceSlug = entry.sourceSlug || entry.slug;
      const sourceTitle = sourceTitlesBySlug.get(sourceSlug) || entry.sourceTitle || entry.title;
      sources.set(sourceSlug, sourceTitle);

      if (text && snippets.length < 6) {
        snippets.push(text.slice(0, 260).replace(/\s+/g, ' ').trim());
      }
    });

  return {
    sources,
    snippets
  };
}

function buildSourceConceptBody(definition, sourceTitles) {
  const bodyLines = [
    `# ${definition.title}`,
    '',
    ...definition.paragraphs
  ];

  if (definition.links.length) {
    bodyLines.push('', '## Verbonden begrippen', '', ...definition.links.map((title) => `- [[${title}]]`));
  }

  if (sourceTitles.length) {
    bodyLines.push(
      '',
      '## Bronspoor',
      '',
      `Dit begrip wordt in de bronlaag zichtbaar via ${formatWikiLinkSeries(sourceTitles)}. De woordenschat bewaart hier het dragende begrip, niet elke toevallige woordgroep waarin het voorkomt.`
    );
  }

  return bodyLines.join('\n');
}

function buildSourceVocabularyItems(sourceEntries, existingItems, ignoredTerms = []) {
  const ignored = new Set(ignoredTerms.map((term) => Core.normalizeTerm(term)).filter(Boolean));
  const existingTerms = new Set();
  const sourceTitlesBySlug = new Map(
    sourceEntries
      .filter((entry) => entry.indexType === 'text')
      .map((entry) => [entry.slug, entry.title])
  );

  existingItems.forEach((item) => {
    [item.title, ...((Array.isArray(item.links) ? item.links : []))].forEach((term) => {
      const normalized = Core.normalizeTerm(term);
      if (normalized) existingTerms.add(normalized);
    });
  });

  return SOURCE_CONCEPT_DEFINITIONS
    .filter((definition) => {
      const normalized = Core.normalizeTerm(definition.title);
      return normalized && !ignored.has(normalized) && !existingTerms.has(normalized);
    })
    .map((definition) => {
      const evidence = collectSourceConceptEvidence(definition, sourceEntries, sourceTitlesBySlug);
      const sourceTitles = [...evidence.sources.values()];

      return {
        slug: Core.slugify(definition.title),
        title: definition.title,
        summary: definition.summary,
        links: definition.links,
        body: buildSourceConceptBody(definition, sourceTitles),
        kind: 'source-concept',
        sourceSlug: [...evidence.sources.keys()][0] || '',
        indexType: 'word',
        resolveAsTerm: true,
        searchText: [
          definition.title,
          definition.summary,
          ...definition.links,
          ...(definition.variants || []),
          ...sourceTitles,
          ...evidence.snippets
        ].join('\n')
      };
    });
}

function cleanWikiText(source) {
  let text = String(source || '');

  text = text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*\[\[(?:Bestand|File):.*?\]\]\s*$/gim, ' ')
    .replace(/^\s*__[^_]+__\s*$/gim, ' ');

  text = stripBalanced(text, '{|', '|}');
  text = stripBalanced(text, '{{', '}}');

  text = text
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '$2')
    .replace(/\[(https?:\/\/[^\s\]]+)\]/g, '$1')
    .replace(/'''''([^']+)'''''/g, '$1')
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/^\s*[*#:;]+\s?/gm, '')
    .replace(/&nbsp;/gi, ' ');

  return compressWhitespace(text);
}

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => compressWhitespace(sentence))
    .filter(Boolean);
}

function extractWikipediaLead(source) {
  const leadSource = String(source || '').split(/\n==/)[0] || '';
  const withoutFiles = leadSource.replace(/^\s*\[\[(?:Bestand|File):.*?\]\]\s*$/gim, ' ');
  const cleaned = cleanWikiText(withoutFiles);

  if (!cleaned) return '';

  const paragraphs = withoutFiles
    .split(/\n\s*\n/)
    .map((paragraph) => cleanWikiText(paragraph))
    .filter((paragraph) => paragraph.length >= 48);

  if (paragraphs.length) return paragraphs[0];
  return cleaned;
}

function extractWikipediaEtymology(text) {
  const sentences = splitSentences(text);
  const matches = sentences.filter((sentence) => /(afgeleid|oorsprong|oorspronk|terug op|via het|via de|ontleend|afkomstig)/i.test(sentence));
  if (matches.length) return matches.slice(0, 2).join(' ');
  return sentences.slice(0, 2).join(' ');
}

function extractRedirectTarget(source) {
  const match = String(source || '').match(/^#?redirect\s+\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/i);
  return match ? compressWhitespace(match[1]) : '';
}

function extractLanguageSection(source, marker) {
  const text = String(source || '');
  const match = text.match(new RegExp(`\\{\\{=${marker}=\\}\\}([\\s\\S]*?)(?=\\n\\{\\{=[a-z]{3}=\\}\\}|$)`, 'i'));
  return match ? match[1].trim() : '';
}

function extractWiktionaryDefinition(sectionSource) {
  const lines = String(sectionSource || '').split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith('#') || line.startsWith('#:') || line.startsWith('#*')) continue;
    const cleaned = cleanWikiText(line.replace(/^#+\s*/, ''));
    if (cleaned) return cleaned;
  }
  return '';
}

function extractWiktionaryEtymology(sectionSource) {
  const lines = String(sectionSource || '').split(/\r?\n/);
  const collected = [];
  let inside = false;

  for (const line of lines) {
    if (/^\{\{-etym-/.test(line.trim())) {
      inside = true;
      continue;
    }

    if (inside && /^\{\{-[a-z0-9]+-/.test(line.trim())) {
      break;
    }

    if (!inside) continue;

    const cleaned = cleanWikiText(line.replace(/^\*\s*/, ''));
    if (cleaned) {
      collected.push(cleaned);
    }
  }

  if (!collected.length) return '';
  return collected.slice(0, 3).join(' ');
}

function isDisambiguationPage(source, description = '') {
  return /\{\{dp/i.test(String(source || '')) || /doorverwijspagina/i.test(String(description || ''));
}

async function fetchJson(url, attempt = 0) {
  const cached = RESPONSE_CACHE.get(url);
  if (cached) {
    return cached instanceof Promise ? cached : Promise.resolve(cached);
  }

  const request = (async () => {
    let response;

    try {
      const timeoutSignal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(15000)
        : undefined;
      response = await fetch(url, {
        signal: timeoutSignal,
        headers: {
          Accept: 'application/json',
          'Api-User-Agent': USER_AGENT,
          'User-Agent': USER_AGENT
        }
      });
    } catch (error) {
      if (attempt < 4) {
        RESPONSE_CACHE.delete(url);
        await sleep(700 * (2 ** attempt));
        return fetchJson(url, attempt + 1);
      }
      throw error;
    }

    if (!response.ok) {
      if ((response.status === 429 || response.status >= 500) && attempt < 4) {
        const retryAfterSeconds = Number(response.headers.get('retry-after'));
        const waitMilliseconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds * 1000
          : 600 * (2 ** attempt);

        RESPONSE_CACHE.delete(url);
        await sleep(waitMilliseconds);
        return fetchJson(url, attempt + 1);
      }

      const error = new Error(`HTTP ${response.status} for ${url}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  })();

  RESPONSE_CACHE.set(url, request);

  try {
    const data = await request;
    RESPONSE_CACHE.set(url, data);
    return data;
  } catch (error) {
    RESPONSE_CACHE.delete(url);
    throw error;
  }
}

async function tryFetchPageSource(host, title, redirectDepth = 0) {
  const key = String(title || '').replace(/ /g, '_');
  const url = `https://${host}/w/rest.php/v1/page/${encodeURIComponent(key)}`;

  try {
    const data = await fetchJson(url);
    const redirectTarget = extractRedirectTarget(data.source);
    if (redirectTarget && redirectDepth < 3) {
      return tryFetchPageSource(host, redirectTarget, redirectDepth + 1);
    }
    return {
      host,
      key: data.key || key,
      title: data.title || String(title || '').replace(/_/g, ' '),
      source: String(data.source || ''),
      url: buildWikiUrl(host, data.key || key)
    };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function searchTitles(host, query, limit = 6) {
  const url = `https://${host}/w/rest.php/v1/search/title?q=${encodeURIComponent(String(query || ''))}&limit=${limit}`;

  try {
    const data = await fetchJson(url);
    return Array.isArray(data.pages) ? data.pages : [];
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

function scoreSearchCandidate(page, variants) {
  const baseTitle = String(page.title || '').replace(/\s*\([^)]*\)\s*/g, ' ');
  const normalizedTitle = Core.normalizeTerm(baseTitle);
  let score = 0;

  if (!normalizedTitle) return -100;
  if (/doorverwijspagina/i.test(String(page.description || ''))) return -100;

  if (variants.has(normalizedTitle)) score += 10;
  if ([...variants].some((variant) => normalizedTitle.startsWith(`${variant} `))) score += 6;
  if (String(page.title || '').includes('(')) score += 1;

  return score;
}

async function resolveWikipediaSource(entry, hosts = ['nl.wikipedia.org', 'en.wikipedia.org']) {
  const title = String(entry.title || '').trim();
  const isLetter = entry.indexType === 'letter' || /^[A-Za-z]$/.test(title);
  const variants = buildVariantKeys(title);

  for (const host of hosts) {
    if (isLetter) {
      const exactLetter = await tryFetchPageSource(host, `${title.toUpperCase()}_(letter)`);
      if (exactLetter && !isDisambiguationPage(exactLetter.source)) {
        return exactLetter;
      }
    }

    const exact = await tryFetchPageSource(host, title);
    if (exact && !isDisambiguationPage(exact.source)) {
      const exactBase = Core.normalizeTerm(String(exact.title || '').replace(/\s*\([^)]*\)\s*/g, ' '));
      if (variants.has(exactBase)) {
        return exact;
      }
    }

    const matches = await searchTitles(host, title);
    let bestMatch = null;
    let bestScore = -100;

    for (const candidate of matches) {
      const score = scoreSearchCandidate(candidate, variants);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    if (bestMatch && bestScore >= 8) {
      const resolved = await tryFetchPageSource(host, bestMatch.key || bestMatch.title);
      if (resolved && !isDisambiguationPage(resolved.source, bestMatch.description)) {
        return resolved;
      }
    }
  }

  return null;
}

async function resolveWiktionarySource(entry) {
  const title = String(entry.title || '').trim();
  const attempts = [];

  if (title) attempts.push(title);
  if (title && title.toLowerCase() !== title) attempts.push(title.toLowerCase());

  for (const attempt of attempts) {
    const page = await tryFetchPageSource('nl.wiktionary.org', attempt);
    if (!page) continue;
    const dutchSection = extractLanguageSection(page.source, 'nld');
    if (!dutchSection) continue;
    return {
      ...page,
      sectionSource: dutchSection
    };
  }

  const matches = await searchTitles('nl.wiktionary.org', title);
  const variants = buildVariantKeys(title);

  for (const candidate of matches) {
    const score = scoreSearchCandidate(candidate, variants);
    if (score < 10) continue;
    const page = await tryFetchPageSource('nl.wiktionary.org', candidate.key || candidate.title);
    if (!page) continue;
    const dutchSection = extractLanguageSection(page.source, 'nld');
    if (!dutchSection) continue;
    return {
      ...page,
      sectionSource: dutchSection
    };
  }

  return null;
}

function buildSourceInfo(page, project, language) {
  if (!page) return null;
  return {
    project,
    language,
    title: page.title,
    url: page.url
  };
}

function buildUnresolvedContext(entry) {
  return {
    slug: entry.slug,
    title: entry.title,
    indexType: entry.indexType || 'word',
    generatedAt: new Date().toISOString(),
    status: 'unresolved',
    intro: null,
    etymology: null,
    fallbackNote: 'Voor deze ingang werd nog geen voldoende betrouwbare externe duiding gevonden.',
    sources: []
  };
}

async function generateExternalContext(entry) {
  const normalizedEntry = {
    slug: Core.slugify(entry.slug || entry.title),
    title: String(entry.title || '').trim(),
    indexType: entry.indexType || (/^[A-Za-z]$/.test(String(entry.title || '').trim()) ? 'letter' : 'word')
  };

  if (!normalizedEntry.title) {
    throw new Error('Kan geen externe context genereren zonder titel.');
  }

  const wiktionaryPage = await resolveWiktionarySource(normalizedEntry);
  await sleep(120);
  const wikipediaPage = await resolveWikipediaSource(normalizedEntry);

  const wiktionaryDefinition = wiktionaryPage ? extractWiktionaryDefinition(wiktionaryPage.sectionSource) : '';
  const wiktionaryEtymology = wiktionaryPage ? extractWiktionaryEtymology(wiktionaryPage.sectionSource) : '';
  const wikipediaLead = wikipediaPage ? extractWikipediaLead(wikipediaPage.source) : '';
  const wikipediaEtymology = wikipediaLead && (
    normalizedEntry.indexType === 'letter' ||
    /(afgeleid|oorsprong|oorspronk|terug op|via het|via de|ontleend|afkomstig)/i.test(wikipediaLead)
  )
    ? extractWikipediaEtymology(wikipediaLead)
    : '';

  const introText = wiktionaryDefinition || wikipediaLead;
  const introSource = introText
    ? (wiktionaryDefinition
      ? buildSourceInfo(wiktionaryPage, 'Wiktionary', 'nl')
      : buildSourceInfo(wikipediaPage, 'Wikipedia', wikipediaPage && wikipediaPage.host.startsWith('nl.') ? 'nl' : 'en'))
    : null;

  const etymologyText = wiktionaryEtymology || wikipediaEtymology;
  const etymologySource = etymologyText
    ? (wiktionaryEtymology
      ? buildSourceInfo(wiktionaryPage, 'Wiktionary', 'nl')
      : buildSourceInfo(wikipediaPage, 'Wikipedia', wikipediaPage && wikipediaPage.host.startsWith('nl.') ? 'nl' : 'en'))
    : null;

  if (!introText && !etymologyText) {
    return buildUnresolvedContext(normalizedEntry);
  }

  const sources = [introSource, etymologySource]
    .filter(Boolean)
    .filter((source, index, list) => list.findIndex((entrySource) => entrySource.url === source.url) === index);

  return {
    slug: normalizedEntry.slug,
    title: normalizedEntry.title,
    indexType: normalizedEntry.indexType,
    generatedAt: new Date().toISOString(),
    status: 'ready',
    intro: introText ? {
      label: 'Internetverklaring',
      text: introText,
      source: introSource
    } : null,
    etymology: etymologyText ? {
      label: 'Etymologie',
      text: etymologyText,
      source: etymologySource
    } : null,
    fallbackNote: '',
    sources
  };
}

function getCachePath(slug) {
  return path.join(GENERATED_DIR, `${Core.slugify(slug)}.json`);
}

async function readCachedExternalContext(slug) {
  try {
    const raw = await fs.readFile(getCachePath(slug), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeExternalContext(context) {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const cachePath = getCachePath(context.slug);
  await fs.writeFile(cachePath, `${JSON.stringify(context, null, 2)}\n`, 'utf8');
  return cachePath;
}

async function readVisibleExternalEntries() {
  const markdownFiles = (await fs.readdir(ITEMS_DIR)).filter((name) => name.endsWith('.md')).sort();
  const canonicalItems = [];

  for (const name of markdownFiles) {
    const filePath = path.join(ITEMS_DIR, name);
    const markdown = await fs.readFile(filePath, 'utf8');
    const item = Core.parseItemMarkdown(markdown, path.relative(ROOT_DIR, filePath));
    canonicalItems.push({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      links: Array.isArray(item.links) ? uniqueTerms(item.links) : [],
      body: Core.stripLeadingTitleHeading(String(item.body || '').trim(), item.title),
      kind: 'canonical',
      indexType: 'word',
      resolveAsTerm: true
    });
  }

  canonicalItems.sort((left, right) => collator.compare(left.title, right.title));

  const canonicalTermEntries = buildTermEntries(canonicalItems);
  const canonicalOutgoingBySlug = new Map();
  canonicalItems.forEach((item) => {
    canonicalOutgoingBySlug.set(item.slug, collectOutgoingLinks(item, canonicalTermEntries));
  });

  const syntheticItems = buildSyntheticTermItems(canonicalItems, canonicalOutgoingBySlug);

  let sourceEntries = [];
  try {
    const sourceCatalog = JSON.parse(await fs.readFile(SOURCE_CATALOG_PATH, 'utf8'));
    sourceEntries = Array.isArray(sourceCatalog.entries)
      ? sourceCatalog.entries.map((entry) => ({
        ...entry,
        links: Array.isArray(entry.links) ? uniqueTerms(entry.links) : [],
        resolveAsTerm: entry.resolveAsTerm === true
      }))
      : [];
  } catch (error) {
    sourceEntries = [];
  }

  let ignoredTerms = [];
  try {
    const markdown = await fs.readFile(IGNORED_TERMS_PATH, 'utf8');
    ignoredTerms = markdown
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*-\s+(.*)$/))
      .filter(Boolean)
      .map((match) => match[1].trim())
      .filter(Boolean);
  } catch (error) {
    ignoredTerms = [];
  }

  const sourceVocabularyItems = buildSourceVocabularyItems(
    sourceEntries,
    [...canonicalItems, ...syntheticItems],
    ignoredTerms
  );
  const letterEntries = sourceEntries
    .filter((entry) => entry.indexType === 'letter')
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      indexType: 'letter'
    }));

  const wordEntries = [...canonicalItems, ...syntheticItems, ...sourceVocabularyItems].map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    indexType: 'word'
  }));

  const seen = new Set();
  return [...wordEntries, ...letterEntries].filter((entry) => {
    const key = `${entry.slug}:${entry.indexType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function generateAndPersistExternalContext(entry, options = {}) {
  if (options.preferCache !== false) {
    const cached = await readCachedExternalContext(entry.slug);
    if (cached) return cached;
  }

  const context = await generateExternalContext(entry);
  if (options.persist !== false) {
    await writeExternalContext(context);
  }
  return context;
}

async function generateAllExternalContexts(options = {}) {
  const entries = options.entries || await readVisibleExternalEntries();
  const results = [];
  const progressEvery = Number(options.progressEvery || 25);
  const entryTimeoutMs = Number(options.entryTimeoutMs || 30000);

  for (const [index, entry] of entries.entries()) {
    let context;

    try {
      context = await Promise.race([
        generateAndPersistExternalContext(entry, options),
        timeoutAfter(entryTimeoutMs, `externe context voor ${entry.slug}`)
      ]);
    } catch (error) {
      context = buildUnresolvedContext(entry);
      if (options.persist !== false) {
        await writeExternalContext(context);
      }
    }

    results.push(context);
    if (progressEvery > 0 && ((index + 1) % progressEvery === 0 || index === entries.length - 1)) {
      console.log(`[wiki:external] ${index + 1}/${entries.length} verwerkt`);
    }
    await sleep(120);
  }

  return results;
}

module.exports = {
  GENERATED_DIR,
  readCachedExternalContext,
  writeExternalContext,
  readVisibleExternalEntries,
  generateExternalContext,
  generateAndPersistExternalContext,
  generateAllExternalContexts
};
