(function (globalScope, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  globalScope.SVHHWikiCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
  const STOPWORDS = new Set([
    'aan', 'al', 'alleen', 'als', 'alsof', 'altijd', 'and', 'angle', 'are', 'bij', 'binnen',
    'buildstap', 'but', 'compact', 'dan', 'daarom', 'dat', 'de', 'den', 'der', 'des', 'desktop',
    'die', 'dit', 'doet', 'door', 'dragen', 'een', 'eens', 'en', 'er', 'for', 'geen', 'had',
    'heb', 'heeft', 'het', 'hier', 'hoe', 'html', 'hun', 'iemand', 'iets', 'in', 'into', 'is',
    'it', 'javascript', 'je', 'jij', 'kan', 'kun', 'kunnen', 'maar', 'maken', 'met', 'mij',
    'mijn', 'mobile', 'moet', 'naar', 'niet', 'nog', 'nu', 'of', 'om', 'ons', 'ook', 'op',
    'opnieuw', 'over', 'plain', 'samen', 'short', 'te', 'that', 'the', 'their', 'them', 'then',
    'there', 'to', 'tot', 'uit', 'van', 'veel', 'verantwoordelijkheid', 'voor', 'waar', 'was',
    'wat', 'we', 'weer', 'wel', 'werd', 'wie', 'wij', 'worden', 'wordt', 'you', 'your', 'ze',
    'zei', 'zich', 'zij', 'zo', 'zonder'
  ]);

  function uniqueStrings(values) {
    const seen = new Set();
    const result = [];

    values.forEach((value) => {
      const normalized = typeof value === 'string' ? value.trim() : '';
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      result.push(normalized);
    });

    return result;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function normalizeWhitespace(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function normalizeTerm(value) {
    return normalizeWhitespace(
      String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' en ')
        .replace(/['’]/g, '')
        .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
        .toLowerCase()
    );
  }

  function slugify(value) {
    const normalized = normalizeTerm(value)
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return normalized || 'item';
  }

  function getInitialLetter(value) {
    const firstCharacter = String(value ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .charAt(0)
      .toUpperCase();

    return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : '#';
  }

  function formatYamlString(value) {
    return JSON.stringify(String(value ?? ''));
  }

  function parseFrontmatter(markdown) {
    const source = String(markdown ?? '');

    if (!source.startsWith('---')) {
      return { data: {}, body: source.trimStart() };
    }

    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

    if (!match) {
      return { data: {}, body: source.trimStart() };
    }

    const rawFrontmatter = match[1];
    const body = match[2];
    const data = {};
    let currentKey = null;

    rawFrontmatter.split(/\r?\n/).forEach((line) => {
      const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

      if (keyMatch) {
        currentKey = keyMatch[1];
        const rawValue = keyMatch[2].trim();

        if (!rawValue) {
          data[currentKey] = [];
          return;
        }

        if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
          data[currentKey] = rawValue
            .slice(1, -1)
            .split(',')
            .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
          return;
        }

        data[currentKey] = rawValue.replace(/^['"]|['"]$/g, '');
        return;
      }

      const listMatch = line.match(/^\s*-\s+(.*)$/);

      if (listMatch && currentKey) {
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = [];
        }

        data[currentKey].push(listMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      }
    });

    return { data, body };
  }

  function parseWikilinks(text) {
    const source = String(text ?? '');
    const matches = [];
    let match;

    while ((match = WIKILINK_RE.exec(source))) {
      matches.push({
        raw: match[0],
        target: normalizeWhitespace(match[1]),
        label: normalizeWhitespace(match[2] || match[1]),
        index: match.index
      });
    }

    WIKILINK_RE.lastIndex = 0;
    return matches;
  }

  function stripMarkdown(text) {
    const source = String(text ?? '');
    const withoutFrontmatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/u, '');

    return normalizeWhitespace(
      withoutFrontmatter
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(WIKILINK_RE, (_, target, label) => ` ${label || target} `)
        .replace(MARKDOWN_LINK_RE, (_, label) => ` ${label} `)
        .replace(/<[^>]+>/g, ' ')
        .replace(/[*_#>`~-]/g, ' ')
    );
  }

  function stashFactory() {
    const values = [];

    return {
      store(html) {
        const token = `\u0000${values.length}\u0000`;
        values.push(html);
        return token;
      },
      restore(text) {
        return text.replace(/\u0000(\d+)\u0000/g, (_, index) => values[Number(index)] || '');
      }
    };
  }

  function renderInline(text, options) {
    const stash = stashFactory();
    const settings = options || {};
    let working = String(text ?? '');

    working = working.replace(/`([^`]+)`/g, (_, code) => stash.store(`<code>${escapeHtml(code)}</code>`));
    working = working.replace(WIKILINK_RE, (_, rawTarget, rawLabel) => {
      const target = normalizeWhitespace(rawTarget);
      const label = normalizeWhitespace(rawLabel || rawTarget);
      const resolved = typeof settings.resolveLink === 'function' ? settings.resolveLink(target) : null;

      if (resolved) {
        return stash.store(
          `<a href="#wiki:${escapeAttribute(resolved.slug)}" class="wiki-link" data-wiki-slug="${escapeAttribute(resolved.slug)}" data-wiki-target="${escapeAttribute(target)}">${escapeHtml(label)}</a>`
        );
      }

      return stash.store(
        `<span class="wiki-link wiki-link-broken" data-wiki-target="${escapeAttribute(target)}">${escapeHtml(label)}</span>`
      );
    });

    working = working.replace(MARKDOWN_LINK_RE, (_, rawLabel, rawUrl) => {
      const label = rawLabel.trim();
      const url = rawUrl.trim();
      return stash.store(
        `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`
      );
    });

    working = escapeHtml(working);
    working = working.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    working = working.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    working = stash.restore(working);

    return working;
  }

  function renderMarkdown(markdown, options) {
    const lines = String(markdown ?? '').replace(/\r/g, '').split('\n');
    const html = [];
    let paragraphLines = [];
    let listType = '';
    let listItems = [];
    let quoteLines = [];
    let codeFence = null;
    let codeLines = [];

    function flushParagraph() {
      if (!paragraphLines.length) return;
      html.push(`<p>${renderInline(paragraphLines.join(' '), options)}</p>`);
      paragraphLines = [];
    }

    function flushList() {
      if (!listType || !listItems.length) return;
      html.push(`<${listType}>${listItems.map((entry) => `<li>${renderInline(entry, options)}</li>`).join('')}</${listType}>`);
      listType = '';
      listItems = [];
    }

    function flushQuote() {
      if (!quoteLines.length) return;
      html.push(`<blockquote>${renderMarkdown(quoteLines.join('\n'), options)}</blockquote>`);
      quoteLines = [];
    }

    function flushCode() {
      if (!codeFence) return;
      const languageClass = codeFence ? ` class="language-${escapeAttribute(codeFence)}"` : '';
      html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      codeFence = null;
      codeLines = [];
    }

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (codeFence !== null) {
        if (trimmed.startsWith('```')) {
          flushCode();
        } else {
          codeLines.push(line);
        }
        return;
      }

      const codeMatch = trimmed.match(/^```(.*)$/);
      if (codeMatch) {
        flushParagraph();
        flushList();
        flushQuote();
        codeFence = codeMatch[1].trim();
        codeLines = [];
        return;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        flushQuote();
        return;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        flushQuote();
        const level = headingMatch[1].length;
        html.push(`<h${level}>${renderInline(headingMatch[2], options)}</h${level}>`);
        return;
      }

      if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
        flushParagraph();
        flushList();
        flushQuote();
        html.push('<hr />');
        return;
      }

      const quoteMatch = line.match(/^\s*>\s?(.*)$/);
      if (quoteMatch) {
        flushParagraph();
        flushList();
        quoteLines.push(quoteMatch[1]);
        return;
      }

      const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (unorderedMatch) {
        flushParagraph();
        flushQuote();
        if (listType && listType !== 'ul') {
          flushList();
        }
        listType = 'ul';
        listItems.push(unorderedMatch[1]);
        return;
      }

      const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (orderedMatch) {
        flushParagraph();
        flushQuote();
        if (listType && listType !== 'ol') {
          flushList();
        }
        listType = 'ol';
        listItems.push(orderedMatch[1]);
        return;
      }

      flushQuote();
      if (listType) {
        flushList();
      }
      paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushList();
    flushQuote();
    flushCode();

    return html.join('');
  }

  function parseItemMarkdown(markdown, filePath) {
    const parsed = parseFrontmatter(markdown);
    const title = normalizeWhitespace(parsed.data.title || '');
    const summary = normalizeWhitespace(parsed.data.summary || '');
    const links = uniqueStrings(Array.isArray(parsed.data.links) ? parsed.data.links : []);
    const body = String(parsed.body ?? '').trim();

    return {
      title,
      summary,
      links,
      body,
      filePath: filePath || '',
      slug: slugify(title)
    };
  }

  function stripLeadingTitleHeading(markdown, title) {
    const source = String(markdown ?? '').replace(/\r/g, '').trim();
    if (!source) return '';

    const lines = source.split('\n');
    let index = 0;

    while (index < lines.length && !lines[index].trim()) {
      index += 1;
    }

    const firstLine = lines[index] ? lines[index].trim() : '';
    const headingMatch = firstLine.match(/^#\s+(.+)$/);

    if (!headingMatch || normalizeTerm(headingMatch[1]) !== normalizeTerm(title)) {
      return source;
    }

    index += 1;

    while (index < lines.length && !lines[index].trim()) {
      index += 1;
    }

    return lines.slice(index).join('\n').trim();
  }

  function serializeItemMarkdown(item) {
    const title = normalizeWhitespace(item && item.title);
    const summary = normalizeWhitespace(item && item.summary);
    const links = uniqueStrings(Array.isArray(item && item.links) ? item.links : []);
    const body = String((item && item.body) || '').trim();

    return [
      '---',
      `title: ${formatYamlString(title)}`,
      `summary: ${formatYamlString(summary)}`,
      'links:',
      ...(links.length ? links.map((link) => `  - ${formatYamlString(link)}`) : ['  - ""']),
      '---',
      '',
      body
    ].join('\n').replace(/\n{3,}$/g, '\n\n');
  }

  function parseCuratedIndexMarkdown(markdown) {
    return uniqueStrings(parseWikilinks(markdown).map((entry) => entry.target));
  }

  function buildResolver(items) {
    const aliasMap = new Map();

    function register(term, slug, priority) {
      const normalized = normalizeTerm(term);
      if (!normalized) return;

      const current = aliasMap.get(normalized);
      if (!current || priority > current.priority) {
        aliasMap.set(normalized, { slug, priority });
      }
    }

    items.forEach((item) => {
      register(item.title, item.slug, 3);
      register(item.slug, item.slug, 2);

      item.links.forEach((term) => {
        register(term, item.slug, 1);
      });
    });

    return function resolveLink(term) {
      const normalized = normalizeTerm(term);
      if (!normalized) return null;

      const alias = aliasMap.get(normalized);
      if (!alias) return null;

      return items.find((item) => item.slug === alias.slug) || null;
    };
  }

  function buildWikiIndex(rawItems, options) {
    const settings = options || {};
    const items = rawItems
      .map((item) => ({
        title: normalizeWhitespace(item.title),
        summary: normalizeWhitespace(item.summary),
        links: uniqueStrings(item.links || []),
        body: String(item.body || '').trim(),
        filePath: item.filePath || '',
        slug: item.slug || slugify(item.title)
      }))
      .filter((item) => item.title);

    const resolveItem = buildResolver(items);
    const curatedOrder = parseCuratedOrder(settings.curatedTargets || [], items);

    items.forEach((item) => {
      const articleBody = stripLeadingTitleHeading(item.body, item.title);

      const wikilinks = parseWikilinks(item.body);
      const outgoingTerms = [];
      const resolvedLinks = [];
      const brokenLinks = [];
      const seenLinkKey = new Set();

      item.links.forEach((term) => {
        outgoingTerms.push({ source: 'links', term, label: term });
      });

      wikilinks.forEach((link) => {
        outgoingTerms.push({
          source: 'wikilink',
          term: link.target,
          label: link.label
        });
      });

      outgoingTerms.forEach((entry) => {
        const normalized = normalizeTerm(entry.term);
        if (!normalized || seenLinkKey.has(`${entry.source}:${normalized}`)) return;
        seenLinkKey.add(`${entry.source}:${normalized}`);

        const resolved = resolveItem(entry.term);

        if (!resolved || resolved.slug === item.slug) {
          if (!resolved) {
            brokenLinks.push({
              source: entry.source,
              term: entry.term,
              label: entry.label
            });
          }
          return;
        }

        resolvedLinks.push({
          source: entry.source,
          term: entry.term,
          label: entry.label,
          slug: resolved.slug,
          title: resolved.title
        });
      });

      item.resolvedLinks = resolvedLinks;
      item.brokenLinks = brokenLinks;
      item.backlinks = [];
      item.mentions = [];
      item.related = [];
      item.articleBody = articleBody;
      item.searchText = normalizeTerm(
        [item.title, item.summary, item.body, item.links.join(' ')].join(' ')
      );
      item.bodyHtml = '';
      item.articleHtml = '';
    });

    items.forEach((item) => {
      item.resolvedLinks.forEach((link) => {
        const target = items.find((candidate) => candidate.slug === link.slug);
        if (!target) return;

        target.backlinks.push({
          slug: item.slug,
          title: item.title,
          via: link.term,
          source: link.source
        });
      });
    });

    items.forEach((item) => {
      items.forEach((candidate) => {
        if (candidate.slug === item.slug) return;

        const titleNeedle = normalizeTerm(item.title);
        if (!titleNeedle) return;

        if (candidate.searchText.includes(titleNeedle)) {
          item.mentions.push({
            slug: candidate.slug,
            title: candidate.title
          });
        }
      });
    });

    items.forEach((item) => {
      const scoreMap = new Map();
      const ownTargets = new Set(item.resolvedLinks.map((entry) => entry.slug));
      const ownTerms = new Set(item.links.map((term) => normalizeTerm(term)).filter(Boolean));

      items.forEach((candidate) => {
        if (candidate.slug === item.slug) return;

        let score = 0;
        const candidateTargets = new Set(candidate.resolvedLinks.map((entry) => entry.slug));
        const candidateTerms = new Set(candidate.links.map((term) => normalizeTerm(term)).filter(Boolean));

        if (ownTargets.has(candidate.slug)) score += 3;
        if (candidateTargets.has(item.slug)) score += 3;

        ownTargets.forEach((slug) => {
          if (candidateTargets.has(slug)) score += 1;
        });

        ownTerms.forEach((term) => {
          if (candidateTerms.has(term)) score += 1;
        });

        if (score > 0) {
          scoreMap.set(candidate.slug, score);
        }
      });

      item.related = items
        .filter((candidate) => scoreMap.has(candidate.slug))
        .sort((left, right) => {
          const scoreDelta = scoreMap.get(right.slug) - scoreMap.get(left.slug);
          return scoreDelta || left.title.localeCompare(right.title, 'nl');
        })
        .map((candidate) => ({
          slug: candidate.slug,
          title: candidate.title,
          score: scoreMap.get(candidate.slug)
        }));
    });

    items.forEach((item) => {
      item.bodyHtml = renderMarkdown(item.body, {
        resolveLink: (term) => resolveItem(term)
      });
      item.articleHtml = renderMarkdown(item.articleBody, {
        resolveLink: (term) => resolveItem(term)
      });
    });

    return {
      items,
      order: curatedOrder,
      bySlug: Object.fromEntries(items.map((item) => [item.slug, item])),
      resolveLink: (term) => resolveItem(term),
      stats: {
        itemCount: items.length,
        orphanCount: items.filter((item) => !item.backlinks.length && !item.resolvedLinks.length).length,
        brokenLinkCount: items.reduce((sum, item) => sum + item.brokenLinks.length, 0)
      }
    };
  }

  function parseCuratedOrder(curatedTargets, items) {
    const slugs = [];
    const seen = new Set();

    curatedTargets.forEach((entry) => {
      const slug = slugify(entry);
      if (!slug || seen.has(slug) || !items.find((item) => item.slug === slug)) return;
      seen.add(slug);
      slugs.push(slug);
    });

    items
      .filter((item) => !seen.has(item.slug))
      .sort((left, right) => left.title.localeCompare(right.title, 'nl'))
      .forEach((item) => {
        seen.add(item.slug);
        slugs.push(item.slug);
      });

    return slugs;
  }

  function searchItems(index, query, filter, currentSlug) {
    const wikiIndex = index || { items: [], order: [] };
    const normalizedQuery = normalizeTerm(query);
    const queryTerms = normalizedQuery ? normalizedQuery.split(' ').filter(Boolean) : [];
    const itemBySlug = new Map((wikiIndex.items || []).map((item) => [item.slug, item]));
    const order = wikiIndex.order && wikiIndex.order.length
      ? wikiIndex.order.map((slug) => itemBySlug.get(slug)).filter(Boolean)
      : wikiIndex.items.slice();

    let pool = order.slice();

    switch (filter) {
      case 'a-z':
        pool.sort((left, right) => left.title.localeCompare(right.title, 'nl'));
        break;
      case 'with-links':
        pool = pool.filter((item) => item.resolvedLinks.length > 0);
        break;
      case 'without-links':
        pool = pool.filter((item) => item.resolvedLinks.length === 0);
        break;
      case 'related':
        if (!currentSlug || !itemBySlug.has(currentSlug)) {
          pool = [];
        } else {
          const current = itemBySlug.get(currentSlug);
          pool = current.related.map((entry) => itemBySlug.get(entry.slug)).filter(Boolean);
        }
        break;
      default:
        break;
    }

    if (!queryTerms.length) {
      return pool;
    }

    return pool
      .map((item) => {
        let score = 0;

        queryTerms.forEach((term) => {
          if (!item.searchText.includes(term)) return;
          if (normalizeTerm(item.title).includes(term)) score += 40;
          if (normalizeTerm(item.summary).includes(term)) score += 20;
          if (item.links.some((link) => normalizeTerm(link).includes(term))) score += 12;
          if (normalizeTerm(item.body).includes(term)) score += 8;
        });

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, 'nl'))
      .map((entry) => entry.item);
  }

  function extractTermCandidates(sources, wikiIndex, options) {
    const settings = options || {};
    const ignored = new Set(
      uniqueStrings(settings.ignoredTerms || []).map((term) => normalizeTerm(term))
    );
    const existingTerms = new Set();

    (wikiIndex && wikiIndex.items ? wikiIndex.items : []).forEach((item) => {
      existingTerms.add(normalizeTerm(item.title));
      item.links.forEach((term) => existingTerms.add(normalizeTerm(term)));

      [item.title, ...item.links].forEach((term) => {
        normalizeTerm(term).split(' ').forEach((part) => {
          if (part.length >= 4) {
            existingTerms.add(part);
          }
        });
      });
    });

    const candidateMap = new Map();

    (sources || []).forEach((source) => {
      const text = String(source.text || '');
      const stripped = stripMarkdown(text);
      const matches = Array.from(stripped.matchAll(/[\p{L}\p{N}][\p{L}\p{N}&'-]*/gu));
      const tokens = matches.map((match) => ({
        value: match[0],
        normalized: normalizeTerm(match[0])
      }));

      function register(termParts, tokenIndex) {
        const display = termParts.join(' ');
        const normalized = normalizeTerm(display);

        if (!normalized || normalized.length < 4) return;
        if (ignored.has(normalized) || existingTerms.has(normalized) || STOPWORDS.has(normalized)) return;

        const entry = candidateMap.get(normalized) || {
          term: display,
          normalized,
          frequency: 0,
          sourceFiles: new Set(),
          snippets: []
        };

        const start = Math.max(0, tokenIndex - 4);
        const end = Math.min(tokens.length, tokenIndex + termParts.length + 4);
        const snippet = tokens.slice(start, end).map((token) => token.value).join(' ');

        entry.frequency += 1;
        entry.sourceFiles.add(source.path);

        if (snippet && !entry.snippets.includes(snippet) && entry.snippets.length < 4) {
          entry.snippets.push(snippet);
        }

        candidateMap.set(normalized, entry);
      }

      tokens.forEach((token, index) => {
        if (!token.normalized || STOPWORDS.has(token.normalized) || token.normalized.length < 4) return;
        register([token.value], index);

        if (index < tokens.length - 1) {
          const next = tokens[index + 1];
          if (
            next &&
            next.normalized &&
            !STOPWORDS.has(next.normalized) &&
            next.normalized.length >= 3
          ) {
            register([token.value, next.value], index);
          }
        }
      });
    });

    return Array.from(candidateMap.values())
      .filter((entry) => {
        const wordCount = entry.normalized.split(' ').length;
        const minimumFrequency = wordCount > 1 ? 2 : 3;
        return entry.frequency >= minimumFrequency || entry.sourceFiles.size >= 3;
      })
      .sort((left, right) => {
        const frequencyDelta = right.frequency - left.frequency;
        if (frequencyDelta) return frequencyDelta;
        return left.term.localeCompare(right.term, 'nl');
      })
      .slice(0, 120)
      .map((entry) => ({
        term: entry.term,
        frequency: entry.frequency,
        sourceFiles: Array.from(entry.sourceFiles).sort(),
        snippets: entry.snippets
      }));
  }

  return {
    escapeHtml,
    normalizeTerm,
    slugify,
    getInitialLetter,
    parseFrontmatter,
    parseItemMarkdown,
    serializeItemMarkdown,
    parseCuratedIndexMarkdown,
    parseWikilinks,
    stripMarkdown,
    stripLeadingTitleHeading,
    renderMarkdown,
    buildWikiIndex,
    searchItems,
    extractTermCandidates
  };
});
