(() => {
  const changelogPath = './docs/changelog.md';
  const visionTextPath = './docs/visietekst.md';
  const wikiIndexPath = './wiki/meta/curated-index.md';
  const collator = new Intl.Collator('nl', { sensitivity: 'base' });

  function slugify(value) {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/&/g, ' en ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  function normalizeTerm(value) {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/&/g, ' en ')
      .replace(/[’']/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const concepts = [
    {
      group: 'wat',
      title: 'School van het Hart',
      short: 'Een centrum voor collectieve bewustwording.',
      sections: [
        {
          title: 'Een levende leerschool',
          paragraphs: [
            'De School van het Hart is een plek waar we als mensen kunnen samenkomen om bewust te worden, te leren en te oefenen in een andere manier van leven. Geen school in de klassieke zin, maar een levende plek waar theorie en praktijk, hoofd en hart, inzicht en ervaring weer samen mogen vallen.'
          ]
        },
        {
          title: 'Een plek waar alles samenkomt',
          paragraphs: [
            'Ze is tegelijk ontmoetingsplek, leerplek en verzamelplaats. Wat vandaag versnipperd leeft in mensen, inzichten en initiatieven, mag hier samenkomen, op elkaar afgestemd worden en vorm krijgen in het echte leven.'
          ]
        }
      ],
      angle: -80
    },
    {
      group: 'wat',
      title: 'Leren samenleven',
      short: 'Aan en van mekaar leren samenleven.',
      sections: [
        {
          title: 'Samenleven als leerweg',
          paragraphs: [
            'We hebben lang geleerd hoe we apart kunnen functioneren, maar veel minder hoe we echt samen kunnen leven. In de School oefenen we opnieuw hoe het is om te luisteren, af te stemmen, verantwoordelijkheid te dragen, ruimte te geven en ruimte in te nemen.'
          ]
        },
        {
          title: 'De groep als leermeester',
          paragraphs: [
            'Dat leer je niet uit een boek. Je leert het door samen aanwezig te zijn, door fouten te mogen maken en te herstellen, en door te merken wat een groep van je vraagt en wat jij aan een groep te geven hebt. Zo wordt samenleven opnieuw een kunde en geen vaag ideaal.'
          ]
        }
      ],
      angle: -54
    },
    {
      group: 'wat',
      title: 'Natuurverbinding',
      short: 'Verbinding met mekaar en de natuur.',
      sections: [
        {
          title: 'Thuiskomen in de natuur',
          paragraphs: [
            'De School hoort thuis in de natuur. Niet omdat groen mooi staat rond het project, maar omdat aarde, water, lucht en vuur ons helpen vertragen, landen en herinneren wat leven in verbondenheid betekent.'
          ]
        },
        {
          title: 'Gedeelde grond',
          paragraphs: [
            'In een verstedelijkte omgeving is gedeelde natuur een antwoord op een echte nood. Door samen zorg te dragen voor een plek, voor tuinen, water, voedsel en buitenruimte, wordt natuurverbinding iets tastbaars en dagelijks.'
          ]
        }
      ],
      angle: -24
    },
    {
      group: 'wat',
      title: 'Nieuwe wereld',
      short: 'Een model in het klein voor wat wil ontstaan.',
      sections: [
        {
          title: 'Een plek voor de overgang',
          paragraphs: [
            'We voelen dat de oude wereld op haar grenzen botst. De School wil niet blijven praten over wat fout loopt, maar een plek openen waar een andere wereld al geoefend kan worden: een wereld van vrede, gezondheid, creativiteit en verbondenheid.'
          ]
        },
        {
          title: 'Van visie naar vorm',
          paragraphs: [
            'Die nieuwe wereld ontstaat niet in slogans maar in concrete vormen. Door hier oplossingen samen te brengen, uit te proberen en te dragen, wordt de School een klein model van wat later ook elders kan groeien.'
          ]
        }
      ],
      angle: 24
    },
    {
      group: 'wat',
      title: 'Collectieve heling',
      short: 'Samen angst en collectief trauma helen.',
      sections: [
        {
          title: 'Heling gebeurt niet alleen',
          paragraphs: [
            'Veel mensen hebben al individueel werk gedaan, maar er is een grens aan wat je alleen kan helen. Angst, verwarring en oude pijn zitten niet alleen in personen, maar ook tussen mensen en in het grotere verhaal waarin we leven.'
          ]
        },
        {
          title: 'Een veilige bedding',
          paragraphs: [
            'Daarom is de School ook een plek van collectieve heling. In een veilige setting kunnen we mekaar helpen om patronen te zien, spanning te ontladen en stilaan los te komen uit angst en zelfdestructie.'
          ]
        }
      ],
      angle: 54
    },
    {
      group: 'wat',
      title: 'Liefde in de praktijk',
      short: 'Een liefdesschool in de materie.',
      sections: [
        {
          title: 'Liefde als grondtoon',
          paragraphs: [
            'Liefde is hier geen woord om op afstand te bewonderen. Ze moet voelbaar worden in hoe we spreken, beslissen, ontvangen, delen, bouwen en zorg dragen voor elkaar en voor de plek.'
          ]
        },
        {
          title: 'Liefde als werkwoord',
          paragraphs: [
            'Als angst zakt, komt er ruimte voor eendracht. Dan wordt liefde weer een werkwoord: iets wat zich in daden toont en stap voor stap een andere werkelijkheid mogelijk maakt.'
          ]
        }
      ],
      angle: 80
    },
    {
      group: 'hoe',
      title: 'Taalbewustzijn',
      short: 'De woorden bevrijden zodat communicatie weer helder wordt.',
      sections: [
        {
          title: 'Leven in verhalen',
          paragraphs: [
            'Veel verwarring in onze wereld ontstaat niet alleen door wat we meemaken, maar ook door de woorden waarmee we het benoemen. We leven in verhalen, en zolang die verhalen troebel blijven, blijft ook ons samenleven troebel.'
          ]
        },
        {
          title: 'Woorden bevrijden',
          paragraphs: [
            'Taalbewustzijn helpt ons vertragen in de taal. Door samen te onderzoeken wat woorden betekenen, waar misverstanden ontstaan en hoe we helderder kunnen spreken, bevrijden we communicatie uit de mist en maken we opnieuw ruimte voor waarheid en verbinding.'
          ]
        }
      ],
      angle: 106
    },
    {
      group: 'hoe',
      title: 'Rainbow',
      short: 'Een levend model van people for the people.',
      sections: [
        {
          title: 'Een bewezen inspiratie',
          paragraphs: [
            'De School laat zich sterk inspireren door de Rainbow Gatherings: plekken waar mensen al decennialang zonder commerciele logica samenleven in de natuur, verantwoordelijkheid opnemen en een tijdelijke stam vormen.'
          ]
        },
        {
          title: 'Van tijdelijk naar blijvend',
          paragraphs: [
            'Wat daar tijdelijk mogelijk blijkt, willen we hier een duurzamere vorm geven. De openheid, de eenvoud, het samen dragen, het niet-commerciele en het diepe vertrouwen in the people for the people vormen een belangrijke voedingsbodem voor dit project.'
          ]
        }
      ],
      angle: 132,
      angleMobile: 126
    },
    {
      group: 'hoe',
      title: 'Cirkels',
      short: 'Samen verantwoordelijkheid dragen voor communicatie.',
      sections: [
        {
          title: 'Het gedeelde midden',
          paragraphs: [
            'De cirkel is de basisvorm van het samenkomen. In de cirkel heeft niemand de hoogste plaats en hoeft niemand buiten te vallen; we oefenen er hoe je spreekt, luistert en aanwezig blijft in een gedeeld midden.'
          ]
        },
        {
          title: 'Waar afstemming kan groeien',
          paragraphs: [
            'Daar worden visie, afstemming, informatie en spanningen gedragen. De cirkel is dus niet alleen een gesprekstechniek, maar de plek waar veiligheid groeit en waar het gemeenschappelijke verhaal helder kan worden.'
          ]
        }
      ],
      angle: 158,
      angleMobile: 160
    },
    {
      group: 'hoe',
      title: 'Zelfbestuur',
      short: 'De plek wordt gedragen door wie er aanwezig is.',
      sections: [
        {
          title: 'Samen de plek dragen',
          paragraphs: [
            'De School is geen project dat door een kleine vaste kern voor anderen wordt gerund. Wie aanwezig is, draagt mee, en zo groeit een cultuur waarin verantwoordelijkheid niet uitbesteed wordt maar gedeeld wordt.'
          ]
        },
        {
          title: 'Beweeglijk en gedragen',
          paragraphs: [
            'Daarom is de School ook geen klassiek woonproject. Mensen komen, verblijven, nemen taken op en geven die weer door; tijdelijke focalisers houden voor een tijd de focus op een deel van het geheel, zodat de plek levend en beweeglijk kan blijven.'
          ]
        }
      ],
      angle: 202,
      angleMobile: 196
    },
    {
      group: 'hoe',
      title: 'Magic Hat',
      short: 'Vrije bijdrage, open boekhouding, gedeelde draagkracht.',
      sections: [
        {
          title: 'Vertrouwen in plaats van druk',
          paragraphs: [
            'De School wil financieel niet gebouwd zijn op druk, schuld of uitsluiting. Daarom werken we met het principe van de magic hat: vrije bijdrage naar vermogen, gedragen door vertrouwen, transparantie en het besef dat de plek van iedereen is.'
          ]
        },
        {
          title: 'Geld als gemeenschappelijk middel',
          paragraphs: [
            'Wie geeft, koopt geen macht. Wat in de hoed komt, wordt gemeenschappelijk, en de boekhouding blijft open. Zo verschuift geld van een instrument van scheiding naar een middel om samen ruimte mogelijk te maken.'
          ]
        }
      ],
      angle: 228,
      angleMobile: 230
    },
    {
      group: 'hoe',
      title: 'Spel & creativiteit',
      short: 'Een grote speeltuin om spelenderwijs te leren.',
      sections: [
        {
          title: 'Maken als leerweg',
          paragraphs: [
            'Een nieuwe wereld bouw je niet alleen in gesprekken. Je bouwt ze ook in tuinen, ateliers, zang, theater, ambacht, zachte verbouwingen en alles wat mensen samen kunnen maken met aandacht en verbeelding.'
          ]
        },
        {
          title: 'Een grote speeltuin',
          paragraphs: [
            'Daarom is de School ook een speeltuin. Niet in de zin van vrijblijvendheid, maar omdat spel, kunst en creativiteit mensen openen, verbinden en in beweging brengen. Door samen te maken, leren we samen leven.'
          ]
        }
      ],
      angle: 254,
      angleMobile: 258
    }
  ];

  const orbit = document.getElementById('orbit');
  const orbitMeasure = document.getElementById('orbitMeasure');
  const composition = document.querySelector('.composition');
  const page = document.querySelector('.page');
  const versionTrigger = document.getElementById('versionTrigger');
  const wikiTrigger = document.getElementById('wikiTrigger');
  const visionTrigger = document.getElementById('visionTrigger');
  const frameToggle = document.getElementById('frameToggle');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalGroup = document.getElementById('modal-group');
  const modalShort = document.getElementById('modal-short');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('closeBtn');
  const changelogModal = document.getElementById('changelogModal');
  const changelogBody = document.getElementById('changelog-body');
  const closeChangelogBtn = document.getElementById('closeChangelogBtn');
  const visionModal = document.getElementById('visionModal');
  const visionBody = document.getElementById('vision-body');
  const closeVisionBtn = document.getElementById('closeVisionBtn');
  const wikiModal = document.getElementById('wikiModal');
  const wikiBackBtn = document.getElementById('wikiBackBtn');
  const wikiForwardBtn = document.getElementById('wikiForwardBtn');
  const wikiSearchInput = document.getElementById('wikiSearchInput');
  const wikiStatus = document.getElementById('wikiStatus');
  const wikiIndexView = document.getElementById('wikiIndexView');
  const wikiItemView = document.getElementById('wikiItemView');
  const wikiCloseBtn = document.getElementById('wikiCloseBtn');

  const defaultVersion = versionTrigger.textContent.trim();
  const compactOrbitQuery = window.matchMedia('(max-width: 420px)');
  const conceptsBySlug = new Map(concepts.map((item) => [slugify(item.title), item]));
  const tokens = [];

  let tokenLayoutFrame = 0;
  let lastConceptTrigger = null;
  let lastVisionTrigger = null;
  let lastWikiTrigger = null;

  const changelogState = {
    version: defaultVersion
  };

  const visionState = {
    markdown: '',
    loaded: false,
    loading: null
  };

  const wikiState = {
    loaded: false,
    loading: null,
    error: '',
    items: [],
    itemsBySlug: new Map(),
    termEntries: [],
    indexEntries: [],
    outgoingBySlug: new Map(),
    incomingBySlug: new Map(),
    currentSlug: '',
    backStack: [],
    forwardStack: [],
    query: ''
  };

  concepts.forEach((item) => {
    const button = document.createElement('button');
    button.className = `token ${item.group}`;
    button.type = 'button';
    button.textContent = item.title;
    button.setAttribute('aria-label', item.title);
    button.addEventListener('click', () => openConceptModal(item, button));
    orbit.appendChild(button);
    tokens.push({ item, button });
  });

  function getTokenAngle(item) {
    return compactOrbitQuery.matches && typeof item.angleMobile === 'number'
      ? item.angleMobile
      : item.angle;
  }

  function syncTokenLayout() {
    tokenLayoutFrame = 0;
    const orbitRect = orbit.getBoundingClientRect();
    const measuredRadius = orbitMeasure.getBoundingClientRect().width / 2;
    const radius = measuredRadius || Math.min(orbitRect.width, orbitRect.height) * 0.35;
    const centerX = orbitRect.width / 2;
    const centerY = orbitRect.height / 2;

    if (!radius || !centerX || !centerY) return;

    tokens.forEach(({ item, button }) => {
      const radians = getTokenAngle(item) * Math.PI / 180;
      const x = centerX + Math.sin(radians) * radius;
      const y = centerY - Math.cos(radians) * radius;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
    });
  }

  function scheduleTokenLayout() {
    if (tokenLayoutFrame) cancelAnimationFrame(tokenLayoutFrame);
    tokenLayoutFrame = requestAnimationFrame(syncTokenLayout);
  }

  function updateBodyScrollLock() {
    const isOpen = modal.classList.contains('open')
      || changelogModal.classList.contains('open')
      || visionModal.classList.contains('open')
      || wikiModal.classList.contains('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function setFrameEnabled(enabled) {
    if (!page || !frameToggle) return;
    page.dataset.frameEnabled = enabled ? 'true' : 'false';
    frameToggle.classList.toggle('active', enabled);
    frameToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    frameToggle.setAttribute('aria-label', enabled ? 'Verberg ornamentale kader' : 'Toon ornamentale kader');
    frameToggle.title = enabled ? 'Verberg ornamentale kader' : 'Toon ornamentale kader';
    try {
      window.localStorage.setItem('svhh-frame-enabled', enabled ? 'true' : 'false');
    } catch (error) {
      // Ignore storage failures and keep the current UI state.
    }
  }

  function parseFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { data: {}, body: markdown };

    const data = {};
    let currentKey = '';
    match[1].split('\n').forEach((line) => {
      const listMatch = line.match(/^\s*-\s+(.*)$/);
      if (listMatch && currentKey) {
        if (!Array.isArray(data[currentKey])) data[currentKey] = [];
        data[currentKey].push(listMatch[1].trim());
        return;
      }

      const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!keyMatch) return;
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      data[currentKey] = value ? value : [];
    });

    return { data, body: match[2] };
  }

  function parseCuratedIndex(markdown) {
    return markdown
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- '))
      .map((line) => line.slice(2).trim())
      .filter(Boolean);
  }

  function stripLeadingTitleHeading(markdown, title) {
    const lines = markdown.replace(/\r/g, '').split('\n');
    if (lines[0] && lines[0].trim().toLowerCase() === `# ${title}`.toLowerCase()) {
      return lines.slice(1).join('\n').trim();
    }
    return markdown.trim();
  }

  function uniqueTerms(values) {
    const seen = new Set();
    const list = [];
    values.forEach((value) => {
      if (!value) return;
      const normalized = normalizeTerm(value);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      list.push(value.trim());
    });
    return list;
  }

  function createSnippet(text, start, end) {
    const safeStart = Math.max(0, start - 56);
    const safeEnd = Math.min(text.length, end + 84);
    return text.slice(safeStart, safeEnd).replace(/\s+/g, ' ').trim();
  }

  function renderChangelogStatus(message) {
    changelogBody.replaceChildren();
    const status = document.createElement('p');
    status.className = 'changelog-status';
    status.textContent = message;
    changelogBody.appendChild(status);
  }

  function parseChangelogMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    const fragment = document.createDocumentFragment();
    let currentEntry = null;
    let currentList = null;
    let currentVersion = '';

    function ensureEntry(title) {
      currentEntry = document.createElement('article');
      currentEntry.className = 'changelog-entry';
      const heading = document.createElement('h3');
      heading.textContent = title;
      currentEntry.appendChild(heading);
      fragment.appendChild(currentEntry);
      currentList = null;

      if (!currentVersion) {
        const versionMatch = title.match(/(v\d+\.\d+\.\d+)/i);
        if (versionMatch) currentVersion = versionMatch[1];
      }
    }

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line === '# Changelog') return;

      if (line.startsWith('## ')) {
        ensureEntry(line.slice(3).trim());
        return;
      }

      if (line.startsWith('- ') && currentEntry) {
        if (!currentList) {
          currentList = document.createElement('ul');
          currentEntry.appendChild(currentList);
        }
        const listItem = document.createElement('li');
        listItem.textContent = line.slice(2).trim();
        currentList.appendChild(listItem);
        return;
      }

      if (currentEntry) {
        const paragraph = document.createElement('p');
        paragraph.className = 'changelog-status';
        paragraph.textContent = line;
        currentEntry.appendChild(paragraph);
      }
    });

    return { fragment, version: currentVersion || defaultVersion };
  }

  async function loadChangelog() {
    try {
      const response = await fetch(changelogPath, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      const parsed = parseChangelogMarkdown(markdown);
      changelogBody.replaceChildren(parsed.fragment);
      changelogState.version = parsed.version;
      versionTrigger.textContent = parsed.version;
      versionTrigger.setAttribute('aria-label', `Open changelog voor ${parsed.version}`);
      versionTrigger.title = `Open changelog voor ${parsed.version}`;
    } catch (error) {
      renderChangelogStatus('De changelog kon niet automatisch geladen worden. Werk docs/changelog.md bij en herlaad de pagina.');
      versionTrigger.setAttribute('aria-label', `Open changelog voor ${changelogState.version}`);
      versionTrigger.title = `Open changelog voor ${changelogState.version}`;
    }
  }

  async function loadVisionText() {
    if (visionState.loaded) return visionState.markdown;
    if (visionState.loading) return visionState.loading;

    visionState.loading = fetch(visionTextPath, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((markdown) => {
        visionState.markdown = markdown;
        visionState.loaded = true;
        return markdown;
      })
      .finally(() => {
        visionState.loading = null;
      });

    return visionState.loading;
  }

  function addIncomingLink(targetSlug, entry) {
    if (!wikiState.incomingBySlug.has(targetSlug)) {
      wikiState.incomingBySlug.set(targetSlug, []);
    }
    wikiState.incomingBySlug.get(targetSlug).push(entry);
  }

  function buildIndexEntries(items) {
    const entries = [];
    const seen = new Set();

    items.forEach((item) => {
      const canonicalKey = normalizeTerm(item.title);
      if (!seen.has(canonicalKey)) {
        entries.push({
          term: item.title,
          slug: item.slug,
          title: item.title,
          summary: item.summary,
          isCanonical: true,
          searchText: [item.title, item.summary, item.body, item.links.join(' ')].join(' ')
        });
        seen.add(canonicalKey);
      }

      item.links.forEach((alias) => {
        const normalized = normalizeTerm(alias);
        if (!normalized || seen.has(normalized)) return;
        entries.push({
          term: alias,
          slug: item.slug,
          title: item.title,
          summary: item.summary,
          isCanonical: false,
          searchText: [alias, item.title, item.summary, item.body, item.links.join(' ')].join(' ')
        });
        seen.add(normalized);
      });
    });

    return entries.sort((left, right) => collator.compare(left.term, right.term));
  }

  function findResolvedTermMatches(text, excludeSlug = '') {
    const matches = [];

    wikiState.termEntries.forEach((entry) => {
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

  function resolveWikiTarget(term) {
    const normalized = normalizeTerm(term);
    return wikiState.termEntries.find((entry) => entry.normalized === normalized) || null;
  }

  function openWikiFromAnywhere(slug, trigger) {
    if (!slug) return;
    openWikiModal({ slug, pushHistory: true, trigger });
  }

  function createInlineWikiButton(label, slug) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wiki-inline-link';
    button.textContent = label;
    button.addEventListener('click', () => openWikiFromAnywhere(slug, button));
    return button;
  }

  function appendAutoLinkedText(parent, text, options = {}) {
    if (!text) return;

    if (!wikiState.loaded) {
      parent.appendChild(document.createTextNode(text));
      return;
    }

    const matches = findResolvedTermMatches(text, options.excludeSlug);
    if (!matches.length) {
      parent.appendChild(document.createTextNode(text));
      return;
    }

    let cursor = 0;
    matches.forEach((match) => {
      if (match.start > cursor) {
        parent.appendChild(document.createTextNode(text.slice(cursor, match.start)));
      }
      parent.appendChild(createInlineWikiButton(match.text, match.slug));
      cursor = match.end;
    });

    if (cursor < text.length) {
      parent.appendChild(document.createTextNode(text.slice(cursor)));
    }
  }

  function appendInlineContent(parent, text, options = {}) {
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let cursor = 0;
    let match;

    while ((match = wikiLinkRegex.exec(text))) {
      if (match.index > cursor) {
        appendAutoLinkedText(parent, text.slice(cursor, match.index), options);
      }

      const target = match[1].trim();
      const label = (match[2] || match[1]).trim();
      const resolved = resolveWikiTarget(target);
      if (resolved) {
        parent.appendChild(createInlineWikiButton(label, resolved.slug));
      } else {
        parent.appendChild(document.createTextNode(label));
      }

      cursor = wikiLinkRegex.lastIndex;
    }

    if (cursor < text.length) {
      appendAutoLinkedText(parent, text.slice(cursor), options);
    }
  }

  function createMarkdownBlock(tagName, text, options) {
    const node = document.createElement(tagName);
    appendInlineContent(node, text, options);
    return node;
  }

  function renderMarkdown(markdown, options = {}) {
    const fragment = document.createDocumentFragment();
    const lines = markdown.replace(/\r/g, '').split('\n');
    let index = 0;

    while (index < lines.length) {
      const trimmed = lines[index].trim();
      if (!trimmed) {
        index += 1;
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length, 6);
        fragment.appendChild(createMarkdownBlock(`h${level}`, headingMatch[2].trim(), options));
        index += 1;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const list = document.createElement('ul');
        while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
          const item = document.createElement('li');
          appendInlineContent(item, lines[index].trim().replace(/^[-*]\s+/, ''), options);
          list.appendChild(item);
          index += 1;
        }
        fragment.appendChild(list);
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const list = document.createElement('ol');
        while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
          const item = document.createElement('li');
          appendInlineContent(item, lines[index].trim().replace(/^\d+\.\s+/, ''), options);
          list.appendChild(item);
          index += 1;
        }
        fragment.appendChild(list);
        continue;
      }

      const paragraphLines = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        if (!candidate) break;
        if (/^(#{1,6})\s+/.test(candidate) || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) {
          break;
        }
        paragraphLines.push(candidate);
        index += 1;
      }

      fragment.appendChild(createMarkdownBlock('p', paragraphLines.join(' '), options));
    }

    return fragment;
  }

  function collectOutgoingLinks(item) {
    const outgoing = new Map();
    findResolvedTermMatches(item.body, item.slug).forEach((match) => {
      if (!outgoing.has(match.slug)) outgoing.set(match.slug, true);
    });
    return [...outgoing.keys()];
  }

  function attachSourceBacklinks(kind, label, sourceSlug, text, excludeSlug = '') {
    const unique = new Map();
    findResolvedTermMatches(text, excludeSlug).forEach((match) => {
      if (!unique.has(match.slug)) {
        unique.set(match.slug, {
          kind,
          label,
          sourceSlug,
          snippet: createSnippet(text, match.start, match.end)
        });
      }
    });

    unique.forEach((entry, targetSlug) => addIncomingLink(targetSlug, entry));
  }

  async function loadWikiData() {
    if (wikiState.loaded) return wikiState;
    if (wikiState.loading) return wikiState.loading;

    wikiState.loading = (async () => {
      try {
        await loadVisionText();

        const indexResponse = await fetch(wikiIndexPath, { cache: 'no-store' });
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const titleMarkdown = await indexResponse.text();
        const titles = parseCuratedIndex(titleMarkdown);

        const fetchedItems = await Promise.all(
          titles.map(async (title) => {
            const slug = slugify(title);
            const response = await fetch(`./wiki/items/${slug}.md`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${slug}`);
            const markdown = await response.text();
            const parsed = parseFrontmatter(markdown);
            return {
              slug,
              title: parsed.data.title || title,
              summary: parsed.data.summary || '',
              links: Array.isArray(parsed.data.links) ? uniqueTerms(parsed.data.links) : [],
              body: stripLeadingTitleHeading(parsed.body.trim(), parsed.data.title || title)
            };
          })
        );

        fetchedItems.sort((left, right) => collator.compare(left.title, right.title));
        wikiState.items = fetchedItems;
        wikiState.itemsBySlug = new Map(fetchedItems.map((item) => [item.slug, item]));
        wikiState.indexEntries = buildIndexEntries(fetchedItems);

        const termEntries = [];
        fetchedItems.forEach((item) => {
          [item.title, ...item.links].forEach((term) => {
            const normalized = normalizeTerm(term);
            if (!normalized) return;
            termEntries.push({
              term,
              normalized,
              slug: item.slug,
              title: item.title
            });
          });
        });

        termEntries.sort((left, right) => {
          const leftLength = normalizeTerm(left.term).length;
          const rightLength = normalizeTerm(right.term).length;
          if (leftLength !== rightLength) return rightLength - leftLength;
          return collator.compare(left.term, right.term);
        });

        wikiState.termEntries = termEntries;
        wikiState.outgoingBySlug = new Map();
        wikiState.incomingBySlug = new Map();

        fetchedItems.forEach((item) => {
          const outgoing = collectOutgoingLinks(item);
          wikiState.outgoingBySlug.set(item.slug, outgoing);
          outgoing.forEach((targetSlug) => {
            addIncomingLink(targetSlug, {
              kind: 'wiki',
              slug: item.slug
            });
          });
        });

        concepts.forEach((concept) => {
          const sourceSlug = slugify(concept.title);
          const text = [
            concept.short,
            ...concept.sections.flatMap((section) => [section.title, ...section.paragraphs])
          ].join('\n');
          attachSourceBacklinks('concept', concept.title, sourceSlug, text, sourceSlug);
        });

        if (visionState.markdown) {
          const body = stripLeadingTitleHeading(visionState.markdown, 'School van het Hart');
          attachSourceBacklinks('vision', 'Visietekst', 'vision', body, '');
        }

        wikiState.loaded = true;
      } catch (error) {
        wikiState.error = 'De wiki kon niet geladen worden.';
      } finally {
        wikiState.loading = null;
      }

      return wikiState;
    })();

    return wikiState.loading;
  }

  function groupIndexEntries(entries) {
    const groups = new Map();
    entries.forEach((entry) => {
      const letter = normalizeTerm(entry.term).charAt(0).toUpperCase() || '#';
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(entry);
    });
    return [...groups.entries()].sort((left, right) => collator.compare(left[0], right[0]));
  }

  function renderWikiStatus() {
    if (wikiState.error) {
      wikiStatus.textContent = wikiState.error;
      return;
    }

    const query = wikiState.query.trim().toLowerCase();
    const count = wikiState.indexEntries.filter((entry) => !query || entry.searchText.toLowerCase().includes(query)).length;
    wikiStatus.textContent = `${count} begrippen in de index`;
  }

  function renderWikiIndex() {
    wikiIndexView.replaceChildren();

    if (wikiState.error) {
      const message = document.createElement('p');
      message.className = 'wiki-empty';
      message.textContent = wikiState.error;
      wikiIndexView.appendChild(message);
      renderWikiStatus();
      return;
    }

    const query = wikiState.query.trim().toLowerCase();
    const filtered = wikiState.indexEntries.filter((entry) => !query || entry.searchText.toLowerCase().includes(query));

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'wiki-empty';
      empty.textContent = 'Geen begrippen gevonden voor deze zoekopdracht.';
      wikiIndexView.appendChild(empty);
      renderWikiStatus();
      return;
    }

    groupIndexEntries(filtered).forEach(([letter, entries]) => {
      const group = document.createElement('section');
      group.className = 'wiki-index-group';

      const heading = document.createElement('h2');
      heading.className = 'wiki-index-letter';
      heading.textContent = letter;
      group.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'wiki-index-items';

      entries.forEach((entry) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `wiki-index-entry${entry.isCanonical ? ' is-canonical' : ''}${wikiState.currentSlug === entry.slug ? ' is-active' : ''}`;
        button.addEventListener('click', () => navigateToWikiItem(entry.slug, { pushHistory: true, trigger: button }));

        const term = document.createElement('span');
        term.className = 'wiki-entry-term';
        term.textContent = entry.term;
        button.appendChild(term);

        const target = document.createElement('span');
        target.className = 'wiki-entry-target';
        target.textContent = entry.isCanonical ? entry.summary : `zie ${entry.title}`;
        button.appendChild(target);

        list.appendChild(button);
      });

      group.appendChild(list);
      wikiIndexView.appendChild(group);
    });

    renderWikiStatus();
  }

  function createWikiConnectionCard(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wiki-connection-card';
    button.addEventListener('click', () => navigateToWikiItem(item.slug, { pushHistory: true, trigger: button }));

    const meta = document.createElement('span');
    meta.className = 'wiki-connection-meta';
    meta.textContent = 'Wiki-item';
    button.appendChild(meta);

    const title = document.createElement('span');
    title.className = 'wiki-connection-title';
    title.textContent = item.title;
    button.appendChild(title);

    const snippet = document.createElement('span');
    snippet.className = 'wiki-connection-snippet';
    snippet.textContent = item.summary;
    button.appendChild(snippet);

    return button;
  }

  function createSourceConnectionCard(reference) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wiki-connection-card';
    button.addEventListener('click', () => {
      closeWikiModal({ restoreFocus: false });
      if (reference.kind === 'concept') {
        const concept = conceptsBySlug.get(reference.sourceSlug);
        if (concept) openConceptModal(concept, wikiTrigger);
      } else if (reference.kind === 'vision') {
        openVisionModal(wikiTrigger);
      }
    });

    const meta = document.createElement('span');
    meta.className = 'wiki-connection-meta';
    meta.textContent = reference.kind === 'concept' ? 'Homepage-concept' : 'Visietekst';
    button.appendChild(meta);

    const title = document.createElement('span');
    title.className = 'wiki-connection-title';
    title.textContent = reference.label;
    button.appendChild(title);

    if (reference.snippet) {
      const snippet = document.createElement('span');
      snippet.className = 'wiki-connection-snippet';
      snippet.textContent = reference.snippet;
      button.appendChild(snippet);
    }

    return button;
  }

  function appendConnections(container, headingText, cards) {
    const section = document.createElement('section');
    section.className = 'wiki-relations';

    const heading = document.createElement('h3');
    heading.textContent = headingText;
    section.appendChild(heading);

    if (!cards.length) {
      const empty = document.createElement('p');
      empty.className = 'wiki-empty';
      empty.textContent = 'Geen verbindingen gevonden.';
      section.appendChild(empty);
      container.appendChild(section);
      return;
    }

    const list = document.createElement('div');
    list.className = 'wiki-relations-list';
    cards.forEach((card) => list.appendChild(card));
    section.appendChild(list);
    container.appendChild(section);
  }

  function renderWikiReader() {
    wikiItemView.replaceChildren();

    if (wikiState.error) {
      const message = document.createElement('p');
      message.className = 'wiki-empty';
      message.textContent = wikiState.error;
      wikiItemView.appendChild(message);
      return;
    }

    if (!wikiState.currentSlug) {
      const empty = document.createElement('section');
      empty.className = 'wiki-reader-empty';

      const heading = document.createElement('h2');
      heading.textContent = 'Woordenboek van A tot Z';
      empty.appendChild(heading);

      const paragraph = document.createElement('p');
      paragraph.textContent = 'Blader links door de begrippen uit de conceptteksten en de visietekst. Elke term opent als wiki-item met hyperlinks en backlinks.';
      empty.appendChild(paragraph);

      wikiItemView.appendChild(empty);
      return;
    }

    const item = wikiState.itemsBySlug.get(wikiState.currentSlug);
    if (!item) return;

    const header = document.createElement('header');
    header.className = 'wiki-item-header';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'wiki-item-eyebrow';
    eyebrow.textContent = 'Wiki-item';
    header.appendChild(eyebrow);

    const title = document.createElement('h2');
    title.className = 'wiki-item-title';
    title.textContent = item.title;
    header.appendChild(title);

    const summary = document.createElement('p');
    summary.className = 'wiki-item-summary';
    summary.textContent = item.summary;
    header.appendChild(summary);

    const article = document.createElement('article');
    article.className = 'wiki-article';
    article.appendChild(renderMarkdown(item.body, { excludeSlug: item.slug }));

    const relations = document.createElement('div');
    relations.className = 'wiki-relations-grid';

    const outgoingCards = (wikiState.outgoingBySlug.get(item.slug) || [])
      .map((targetSlug) => wikiState.itemsBySlug.get(targetSlug))
      .filter(Boolean)
      .map((linkedItem) => createWikiConnectionCard(linkedItem));

    const incomingCards = (wikiState.incomingBySlug.get(item.slug) || [])
      .map((entry) => {
        if (entry.kind === 'wiki') {
          const linkedItem = wikiState.itemsBySlug.get(entry.slug);
          return linkedItem ? createWikiConnectionCard(linkedItem) : null;
        }
        return createSourceConnectionCard(entry);
      })
      .filter(Boolean);

    appendConnections(relations, 'Uit', outgoingCards);
    appendConnections(relations, 'In', incomingCards);

    wikiItemView.append(header, article, relations);
  }

  function updateWikiHistoryButtons() {
    wikiBackBtn.disabled = wikiState.backStack.length === 0;
    wikiForwardBtn.disabled = wikiState.forwardStack.length === 0;
  }

  function navigateToWikiItem(slug, options = {}) {
    if (!slug) return;

    if (options.pushHistory && wikiState.currentSlug && wikiState.currentSlug !== slug) {
      wikiState.backStack.push(wikiState.currentSlug);
      wikiState.forwardStack = [];
    }

    wikiState.currentSlug = slug;
    if (options.trigger instanceof HTMLElement) {
      lastWikiTrigger = options.trigger;
    }
    renderWikiReader();
    renderWikiIndex();
    updateWikiHistoryButtons();
  }

  function goBackInWiki() {
    if (!wikiState.backStack.length) return;
    if (wikiState.currentSlug) wikiState.forwardStack.push(wikiState.currentSlug);
    wikiState.currentSlug = wikiState.backStack.pop();
    renderWikiReader();
    renderWikiIndex();
    updateWikiHistoryButtons();
  }

  function goForwardInWiki() {
    if (!wikiState.forwardStack.length) return;
    if (wikiState.currentSlug) wikiState.backStack.push(wikiState.currentSlug);
    wikiState.currentSlug = wikiState.forwardStack.pop();
    renderWikiReader();
    renderWikiIndex();
    updateWikiHistoryButtons();
  }

  function renderVisionStatus(message) {
    visionBody.replaceChildren();
    const status = document.createElement('p');
    status.className = 'changelog-status';
    status.textContent = message;
    visionBody.appendChild(status);
  }

  async function renderVisionBody() {
    try {
      await loadWikiData();
      const markdown = await loadVisionText();
      visionBody.replaceChildren();
      const article = document.createElement('div');
      article.className = 'vision-copy';
      article.appendChild(renderMarkdown(stripLeadingTitleHeading(markdown, 'School van het Hart')));
      visionBody.appendChild(article);
    } catch (error) {
      renderVisionStatus('De visietekst kon niet geladen worden. Werk docs/visietekst.md bij en herlaad de pagina.');
    }
  }

  function renderConceptBody(item) {
    modalBody.replaceChildren();

    item.sections.forEach((section) => {
      const sectionElement = document.createElement('section');

      if (section.title) {
        const heading = document.createElement('h3');
        appendInlineContent(heading, section.title, { excludeSlug: slugify(item.title) });
        sectionElement.appendChild(heading);
      }

      section.paragraphs.forEach((paragraph) => {
        const text = document.createElement('p');
        appendInlineContent(text, paragraph, { excludeSlug: slugify(item.title) });
        sectionElement.appendChild(text);
      });

      modalBody.appendChild(sectionElement);
    });
  }

  function closeConceptModal(options = {}) {
    if (document.activeElement instanceof HTMLElement && modal.contains(document.activeElement) && options.restoreFocus !== false) {
      (lastConceptTrigger || versionTrigger).focus();
    }
    modal.classList.remove('open', 'wat', 'hoe');
    modal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();
  }

  function openConceptModal(item, trigger = document.activeElement) {
    closeChangelogModal({ restoreFocus: false });
    closeVisionModal({ restoreFocus: false });
    closeWikiModal({ restoreFocus: false });
    lastConceptTrigger = trigger instanceof HTMLElement ? trigger : null;
    modal.classList.add('open', item.group);
    modal.classList.remove(item.group === 'wat' ? 'hoe' : 'wat');
    modal.setAttribute('aria-hidden', 'false');
    modalTitle.textContent = item.title;
    modalGroup.textContent = item.group === 'wat' ? 'WAT' : 'HOE';
    modalShort.textContent = item.short;
    renderConceptBody(item);
    if (!wikiState.loaded && !wikiState.loading) {
      loadWikiData().then(() => {
        if (modal.classList.contains('open') && modalTitle.textContent === item.title) {
          renderConceptBody(item);
        }
      });
    } else if (wikiState.loading) {
      wikiState.loading.then(() => {
        if (modal.classList.contains('open') && modalTitle.textContent === item.title) {
          renderConceptBody(item);
        }
      });
    }
    updateBodyScrollLock();
    closeBtn.focus();
  }

  function closeChangelogModal(options = {}) {
    if (document.activeElement instanceof HTMLElement && changelogModal.contains(document.activeElement) && options.restoreFocus !== false) {
      versionTrigger.focus();
    }
    changelogModal.classList.remove('open');
    changelogModal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();
  }

  function openChangelogModal() {
    closeConceptModal({ restoreFocus: false });
    closeVisionModal({ restoreFocus: false });
    closeWikiModal({ restoreFocus: false });
    changelogModal.classList.add('open');
    changelogModal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();
    closeChangelogBtn.focus();
  }

  function closeVisionModal(options = {}) {
    if (document.activeElement instanceof HTMLElement && visionModal.contains(document.activeElement) && options.restoreFocus !== false) {
      (lastVisionTrigger || visionTrigger).focus();
    }
    visionModal.classList.remove('open');
    visionModal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();
  }

  async function openVisionModal(trigger = document.activeElement) {
    lastVisionTrigger = trigger instanceof HTMLElement ? trigger : null;
    closeConceptModal({ restoreFocus: false });
    closeChangelogModal({ restoreFocus: false });
    closeWikiModal({ restoreFocus: false });
    visionModal.classList.add('open');
    visionModal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();
    closeVisionBtn.focus();
    renderVisionStatus('Visietekst wordt geladen...');
    await renderVisionBody();
  }

  function closeWikiModal(options = {}) {
    if (document.activeElement instanceof HTMLElement && wikiModal.contains(document.activeElement) && options.restoreFocus !== false) {
      (lastWikiTrigger || wikiTrigger).focus();
    }
    wikiModal.classList.remove('open');
    wikiModal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();
  }

  async function openWikiModal(options = {}) {
    await loadWikiData();
    closeConceptModal({ restoreFocus: false });
    closeChangelogModal({ restoreFocus: false });
    closeVisionModal({ restoreFocus: false });

    wikiModal.classList.add('open');
    wikiModal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();

    if (options.trigger instanceof HTMLElement) {
      lastWikiTrigger = options.trigger;
    }

    if (options.slug) {
      navigateToWikiItem(options.slug, { pushHistory: options.pushHistory !== false, trigger: options.trigger });
    } else {
      renderWikiReader();
      renderWikiIndex();
      updateWikiHistoryButtons();
    }

    wikiSearchInput.focus();
  }

  async function initializeWiki() {
    await loadWikiData();
    renderWikiIndex();
    renderWikiReader();
    updateWikiHistoryButtons();
  }

  scheduleTokenLayout();
  loadChangelog();
  initializeWiki();

  try {
    const storedFramePreference = window.localStorage.getItem('svhh-frame-enabled');
    setFrameEnabled(storedFramePreference !== 'false');
  } catch (error) {
    setFrameEnabled(true);
  }

  if (typeof compactOrbitQuery.addEventListener === 'function') {
    compactOrbitQuery.addEventListener('change', scheduleTokenLayout);
  } else if (typeof compactOrbitQuery.addListener === 'function') {
    compactOrbitQuery.addListener(scheduleTokenLayout);
  }

  window.addEventListener('resize', scheduleTokenLayout);

  if (typeof ResizeObserver === 'function') {
    const tokenLayoutObserver = new ResizeObserver(() => scheduleTokenLayout());
    tokenLayoutObserver.observe(composition);
  }

  closeBtn.addEventListener('click', () => closeConceptModal());
  closeChangelogBtn.addEventListener('click', () => closeChangelogModal());
  closeVisionBtn.addEventListener('click', () => closeVisionModal());
  wikiCloseBtn.addEventListener('click', () => closeWikiModal());
  versionTrigger.addEventListener('click', openChangelogModal);
  wikiTrigger.addEventListener('click', (event) => openWikiModal({ trigger: event.currentTarget }));
  visionTrigger.addEventListener('click', (event) => openVisionModal(event.currentTarget));
  if (frameToggle) {
    frameToggle.addEventListener('click', () => setFrameEnabled(page.dataset.frameEnabled !== 'true'));
  }
  wikiBackBtn.addEventListener('click', goBackInWiki);
  wikiForwardBtn.addEventListener('click', goForwardInWiki);
  wikiSearchInput.addEventListener('input', (event) => {
    wikiState.query = event.target.value;
    renderWikiIndex();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeConceptModal();
  });

  changelogModal.addEventListener('click', (event) => {
    if (event.target === changelogModal) closeChangelogModal();
  });

  visionModal.addEventListener('click', (event) => {
    if (event.target === visionModal) closeVisionModal();
  });

  wikiModal.addEventListener('click', (event) => {
    if (event.target === wikiModal) closeWikiModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (wikiModal.classList.contains('open')) {
      closeWikiModal();
      return;
    }
    if (visionModal.classList.contains('open')) {
      closeVisionModal();
      return;
    }
    if (changelogModal.classList.contains('open')) {
      closeChangelogModal();
      return;
    }
    if (modal.classList.contains('open')) {
      closeConceptModal();
    }
  });
})();
