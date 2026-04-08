(function () {
  const Core = window.SVHHWikiCore;

  if (!Core) return;

  const refs = {
    reloadBtn: document.getElementById('adminReloadBtn'),
    status: document.getElementById('adminStatus'),
    tabRow: document.getElementById('adminTabRow'),
    itemsScreen: document.getElementById('itemsScreen'),
    editorScreen: document.getElementById('editorScreen'),
    relationsScreen: document.getElementById('relationsScreen'),
    itemsSearchInput: document.getElementById('itemsSearchInput'),
    itemsCount: document.getElementById('itemsCount'),
    itemsList: document.getElementById('itemsList'),
    newItemTitleInput: document.getElementById('newItemTitleInput'),
    newItemBtn: document.getElementById('newItemBtn'),
    saveItemBtn: document.getElementById('saveItemBtn'),
    editorTitleInput: document.getElementById('editorTitleInput'),
    editorSummaryInput: document.getElementById('editorSummaryInput'),
    editorLinksInput: document.getElementById('editorLinksInput'),
    editorBodyInput: document.getElementById('editorBodyInput'),
    editorPreview: document.getElementById('editorPreview'),
    candidateList: document.getElementById('candidateList'),
    brokenLinksList: document.getElementById('brokenLinksList'),
    backlinksList: document.getElementById('backlinksList'),
    orphansList: document.getElementById('orphansList')
  };

  const state = {
    screen: 'items',
    data: null,
    itemQuery: '',
    draft: null
  };

  function setStatus(message) {
    refs.status.textContent = message;
  }

  async function loadData(message) {
    setStatus(message || 'Wiki-data laden…');

    const response = await fetch('/api/wiki/index', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.data = await response.json();
    renderAll();
    setStatus(`Markdown-ingest bijgewerkt: ${state.data.stats.itemCount} items, ${state.data.candidates.length} kandidaten.`);
  }

  function showScreen(screen) {
    state.screen = screen;
    refs.itemsScreen.hidden = screen !== 'items';
    refs.editorScreen.hidden = screen !== 'editor';
    refs.relationsScreen.hidden = screen !== 'relations';

    refs.tabRow.querySelectorAll('[data-screen]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-screen') === screen);
    });
  }

  function parseLinksInput(value) {
    return Array.from(
      new Set(
        String(value || '')
          .split(/\r?\n|,/)
          .map((entry) => entry.trim())
          .filter(Boolean)
      )
    );
  }

  function buildDraftFromItem(item) {
    return {
      previousSlug: item.slug,
      title: item.title,
      summary: item.summary,
      linksText: item.links.join('\n'),
      body: item.body
    };
  }

  function buildBlankDraft(title) {
    const cleanTitle = String(title || '').trim();
    return {
      previousSlug: '',
      title: cleanTitle,
      summary: '',
      linksText: '',
      body: cleanTitle ? `# ${cleanTitle}\n\nNog te beschrijven.` : '# Nieuw item\n\nNog te beschrijven.'
    };
  }

  function fillEditorFields() {
    if (!state.draft) {
      refs.editorTitleInput.value = '';
      refs.editorSummaryInput.value = '';
      refs.editorLinksInput.value = '';
      refs.editorBodyInput.value = '';
      refs.editorPreview.innerHTML = '<div class="admin-empty">Open een bestaand item of maak een nieuw item aan.</div>';
      return;
    }

    refs.editorTitleInput.value = state.draft.title;
    refs.editorSummaryInput.value = state.draft.summary;
    refs.editorLinksInput.value = state.draft.linksText;
    refs.editorBodyInput.value = state.draft.body;
    updatePreview();
  }

  function syncDraftFromInputs() {
    if (!state.draft) return;
    state.draft.title = refs.editorTitleInput.value;
    state.draft.summary = refs.editorSummaryInput.value;
    state.draft.linksText = refs.editorLinksInput.value;
    state.draft.body = refs.editorBodyInput.value;
  }

  function buildPreviewItem() {
    if (!state.draft) return null;

    const previewMarkdown = Core.serializeItemMarkdown({
      title: state.draft.title,
      summary: state.draft.summary,
      links: parseLinksInput(state.draft.linksText),
      body: state.draft.body
    });

    return Core.parseItemMarkdown(previewMarkdown, state.draft.previousSlug || 'preview.md');
  }

  function updatePreview() {
    if (!state.draft || !state.data) {
      refs.editorPreview.innerHTML = '<div class="admin-empty">Nog geen item geselecteerd.</div>';
      return;
    }

    const previewItem = buildPreviewItem();
    if (!previewItem || !previewItem.title.trim()) {
      refs.editorPreview.innerHTML = '<div class="admin-empty">Geef eerst een titel op om de preview te renderen.</div>';
      return;
    }

    const items = state.data.items
      .filter((item) => item.slug !== state.draft.previousSlug)
      .map((item) => ({
        title: item.title,
        summary: item.summary,
        links: item.links,
        body: item.body,
        filePath: item.filePath
      }));

    items.push(previewItem);

    const previewIndex = Core.buildWikiIndex(items, {
      curatedTargets: state.data.curatedTargets.concat(previewItem.title)
    });

    const rendered = previewIndex.bySlug[previewItem.slug];

    refs.editorPreview.innerHTML = rendered
      ? (rendered.articleHtml || rendered.bodyHtml)
      : '<div class="admin-empty">Preview kon niet opgebouwd worden.</div>';
  }

  function renderItems() {
    const items = (state.data ? state.data.items : []).filter((item) => {
      const needle = Core.normalizeTerm(state.itemQuery);
      if (!needle) return true;
      return Core.normalizeTerm([item.title, item.summary, item.links.join(' ')].join(' ')).includes(needle);
    });

    refs.itemsCount.textContent = `${items.length} zichtbaar`;

    if (!items.length) {
      refs.itemsList.innerHTML = '<div class="admin-empty">Geen items gevonden voor deze zoekterm.</div>';
      return;
    }

    refs.itemsList.innerHTML = items.map((item) => `
      <button type="button" class="admin-item-btn" data-open-slug="${Core.escapeHtml(item.slug)}">
        <div>
          <h3>${Core.escapeHtml(item.title)}</h3>
          <p>${Core.escapeHtml(item.summary)}</p>
        </div>
        <p>${item.links.length} linkterm${item.links.length === 1 ? '' : 'en'} · ${item.backlinks.length} backlink${item.backlinks.length === 1 ? '' : 's'}</p>
      </button>
    `).join('');
  }

  function renderRelations() {
    if (!state.data.candidates.length) {
      refs.candidateList.innerHTML = '<div class="admin-empty">Geen kandidaten gevonden buiten de huidige wiki-items en ignore-lijst.</div>';
    } else {
      refs.candidateList.innerHTML = state.data.candidates.map((candidate) => `
        <article class="admin-candidate-card" data-candidate-term="${Core.escapeHtml(candidate.term)}">
          <div class="admin-panel-head">
            <div>
              <h3>${Core.escapeHtml(candidate.term)}</h3>
              <p>${candidate.frequency} treffers in ${candidate.sourceFiles.length} bronbestand${candidate.sourceFiles.length === 1 ? '' : 'en'}</p>
            </div>
          </div>
          <div class="admin-candidate-meta">
            ${candidate.sourceFiles.map((file) => `<span class="admin-link-btn">${Core.escapeHtml(file)}</span>`).join('')}
          </div>
          <ul class="admin-snippet-list">
            ${candidate.snippets.map((snippet) => `<li>${Core.escapeHtml(snippet)}</li>`).join('')}
          </ul>
          <div class="admin-candidate-actions">
            <button type="button" class="admin-inline-btn" data-candidate-action="create">Create item</button>
            <select class="admin-merge-select" data-merge-select>
              <option value="">Merge in bestaand item…</option>
              ${state.data.items.map((item) => `<option value="${Core.escapeHtml(item.slug)}">${Core.escapeHtml(item.title)}</option>`).join('')}
            </select>
            <button type="button" class="admin-inline-btn" data-candidate-action="merge">Merge</button>
            <button type="button" class="admin-inline-btn" data-candidate-action="ignore">Ignore</button>
          </div>
        </article>
      `).join('');
    }

    if (!state.data.brokenLinks.length) {
      refs.brokenLinksList.innerHTML = '<div class="admin-empty">Geen broken links.</div>';
    } else {
      refs.brokenLinksList.innerHTML = state.data.brokenLinks.map((entry) => `
        <article class="admin-link-card">
          <h3>${Core.escapeHtml(entry.title)}</h3>
          <div class="admin-inline-row">
            <button type="button" class="admin-inline-btn" data-open-slug="${Core.escapeHtml(entry.slug)}">Open editor</button>
          </div>
          <ul class="admin-snippet-list">
            ${entry.brokenLinks.map((link) => `<li>${Core.escapeHtml(link.term)}</li>`).join('')}
          </ul>
        </article>
      `).join('');
    }

    const withBacklinks = state.data.items.filter((item) => item.backlinks.length);
    refs.backlinksList.innerHTML = withBacklinks.length
      ? withBacklinks.map((item) => `
          <article class="admin-link-card">
            <h3>${Core.escapeHtml(item.title)}</h3>
            <div class="admin-inline-row">
              <button type="button" class="admin-inline-btn" data-open-slug="${Core.escapeHtml(item.slug)}">Open editor</button>
            </div>
            <ul class="admin-snippet-list">
              ${item.backlinks.map((entry) => `<li>${Core.escapeHtml(entry.title)} via ${Core.escapeHtml(entry.via)}</li>`).join('')}
            </ul>
          </article>
        `).join('')
      : '<div class="admin-empty">Nog geen backlinks gevonden.</div>';

    refs.orphansList.innerHTML = state.data.orphans.length
      ? state.data.orphans.map((item) => `
          <article class="admin-link-card">
            <h3>${Core.escapeHtml(item.title)}</h3>
            <div class="admin-inline-row">
              <button type="button" class="admin-inline-btn" data-open-slug="${Core.escapeHtml(item.slug)}">Open editor</button>
            </div>
          </article>
        `).join('')
      : '<div class="admin-empty">Geen orphan items.</div>';
  }

  function renderAll() {
    renderItems();
    renderRelations();
    fillEditorFields();
    showScreen(state.screen);
  }

  function openItemInEditor(slug) {
    const item = state.data.items.find((entry) => entry.slug === slug);
    if (!item) return;
    state.draft = buildDraftFromItem(item);
    fillEditorFields();
    showScreen('editor');
    setStatus(`Editor geopend voor ${item.title}.`);
  }

  async function saveDraft() {
    syncDraftFromInputs();

    if (!state.draft) return;

    const payload = {
      previousSlug: state.draft.previousSlug,
      title: state.draft.title,
      summary: state.draft.summary,
      links: parseLinksInput(state.draft.linksText),
      body: state.draft.body
    };

    const response = await fetch('/api/wiki/item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Opslaan mislukt.' }));
      throw new Error(error.error || 'Opslaan mislukt.');
    }

    const result = await response.json();
    await loadData('Markdownbestand opslaan…');
    openItemInEditor(result.slug);
    setStatus(`Item opgeslagen als ${result.slug}.md.`);
  }

  async function handleCandidateAction(term, action, targetSlug) {
    const endpointMap = {
      create: '/api/wiki/candidates/create',
      merge: '/api/wiki/candidates/merge',
      ignore: '/api/wiki/candidates/ignore'
    };

    const response = await fetch(endpointMap[action], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ term, targetSlug })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Actie mislukt.' }));
      throw new Error(error.error || 'Actie mislukt.');
    }

    await loadData('Wiki-curatie bijwerken…');
    setStatus(`Candidate "${term}" verwerkt via ${action}.`);
  }

  refs.tabRow.addEventListener('click', (event) => {
    const button = event.target.closest('[data-screen]');
    if (!button) return;
    showScreen(button.getAttribute('data-screen'));
  });

  refs.reloadBtn.addEventListener('click', async () => {
    try {
      await loadData('Wiki-data opnieuw laden…');
    } catch (error) {
      setStatus(error.message);
    }
  });

  refs.itemsSearchInput.addEventListener('input', (event) => {
    state.itemQuery = event.target.value;
    renderItems();
  });

  refs.itemsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-slug]');
    if (!button) return;
    openItemInEditor(button.getAttribute('data-open-slug'));
  });

  refs.newItemBtn.addEventListener('click', () => {
    state.draft = buildBlankDraft(refs.newItemTitleInput.value);
    fillEditorFields();
    showScreen('editor');
    setStatus('Nieuw concept-item geopend in de editor.');
  });

  [refs.editorTitleInput, refs.editorSummaryInput, refs.editorLinksInput, refs.editorBodyInput].forEach((field) => {
    field.addEventListener('input', () => {
      syncDraftFromInputs();
      updatePreview();
    });
  });

  refs.saveItemBtn.addEventListener('click', async () => {
    try {
      await saveDraft();
    } catch (error) {
      setStatus(error.message);
    }
  });

  refs.editorPreview.addEventListener('click', (event) => {
    const wikiLink = event.target.closest('[data-wiki-slug]');
    if (!wikiLink) return;
    event.preventDefault();
    openItemInEditor(wikiLink.getAttribute('data-wiki-slug'));
  });

  refs.relationsScreen.addEventListener('click', async (event) => {
    const openButton = event.target.closest('[data-open-slug]');
    if (openButton) {
      openItemInEditor(openButton.getAttribute('data-open-slug'));
      return;
    }

    const actionButton = event.target.closest('[data-candidate-action]');
    if (!actionButton) return;

    const card = actionButton.closest('[data-candidate-term]');
    if (!card) return;

    const term = card.getAttribute('data-candidate-term');
    const action = actionButton.getAttribute('data-candidate-action');
    const mergeSelect = card.querySelector('[data-merge-select]');
    const targetSlug = mergeSelect ? mergeSelect.value : '';

    if (action === 'merge' && !targetSlug) {
      setStatus('Kies eerst een bestaand item voor de merge.');
      return;
    }

    try {
      await handleCandidateAction(term, action, targetSlug);
    } catch (error) {
      setStatus(error.message);
    }
  });

  loadData().catch((error) => {
    setStatus(error.message || 'Wiki-admin kon niet laden.');
  });
})();
