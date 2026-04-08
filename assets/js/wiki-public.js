(function () {
  const Core = window.SVHHWikiCore;

  if (!Core) return;

  const refs = {
    trigger: document.getElementById('wikiTrigger'),
    modal: document.getElementById('wikiModal'),
    backBtn: document.getElementById('wikiBackBtn'),
    forwardBtn: document.getElementById('wikiForwardBtn'),
    closeBtn: document.getElementById('wikiCloseBtn'),
    searchInput: document.getElementById('wikiSearchInput'),
    status: document.getElementById('wikiStatus'),
    content: document.getElementById('wikiContent'),
    directoryPane: document.getElementById('wikiDirectoryPane'),
    readerPane: document.getElementById('wikiReaderPane'),
    indexView: document.getElementById('wikiIndexView'),
    itemView: document.getElementById('wikiItemView')
  };

  if (!refs.trigger || !refs.modal || !refs.indexView || !refs.itemView) return;

  const state = {
    loaded: false,
    loading: false,
    error: '',
    wikiIndex: null,
    currentSlug: null,
    activePanel: 'index',
    activeTab: 'description',
    query: '',
    backStack: [],
    forwardStack: []
  };
  let syncingHash = false;

  function getItem(slug) {
    return state.wikiIndex && state.wikiIndex.bySlug ? state.wikiIndex.bySlug[slug] : null;
  }

  function currentItem() {
    return getItem(state.currentSlug);
  }

  function getDirectoryItems() {
    if (!state.loaded || !state.wikiIndex) return [];
    return Core.searchItems(state.wikiIndex, state.query, 'a-z', state.currentSlug);
  }

  function itemPathFromTarget(target) {
    return `./wiki/items/${Core.slugify(target)}.md`;
  }

  function closeOtherSiteModals() {
    if (window.SVHHSiteModals && typeof window.SVHHSiteModals.closeAll === 'function') {
      window.SVHHSiteModals.closeAll();
    }
  }

  function updateHash() {
    if (syncingHash) return;

    const nextHash = refs.modal.classList.contains('open')
      ? (state.currentSlug && state.activePanel === 'item' ? `#wiki:${state.currentSlug}` : '#wiki')
      : '';

    if (window.location.hash === nextHash) return;
    syncingHash = true;
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    syncingHash = false;
  }

  async function loadWikiFromApi() {
    const response = await fetch('/api/wiki/index', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rawItems = Array.isArray(payload.items)
      ? payload.items.map((item) => ({
          title: item.title,
          summary: item.summary,
          links: item.links,
          body: item.body,
          filePath: item.filePath,
          slug: item.slug
        }))
      : [];
    const curatedTargets = Array.isArray(payload.curatedTargets) ? payload.curatedTargets : rawItems.map((item) => item.title);

    state.wikiIndex = Core.buildWikiIndex(rawItems, { curatedTargets });
  }

  async function loadWikiFromFiles() {
    const curatedResponse = await fetch('./wiki/meta/curated-index.md', { cache: 'no-store' });
    if (!curatedResponse.ok) throw new Error(`HTTP ${curatedResponse.status}`);

    const curatedMarkdown = await curatedResponse.text();
    const curatedTargets = Core.parseCuratedIndexMarkdown(curatedMarkdown);
    const itemResponses = await Promise.all(
      curatedTargets.map(async (target) => {
        const response = await fetch(itemPathFromTarget(target), { cache: 'no-store' });
        if (!response.ok) throw new Error(`Item ${target} kon niet geladen worden`);
        return {
          filePath: itemPathFromTarget(target),
          markdown: await response.text()
        };
      })
    );

    const items = itemResponses.map((entry) => Core.parseItemMarkdown(entry.markdown, entry.filePath));
    state.wikiIndex = Core.buildWikiIndex(items, { curatedTargets });
  }

  async function loadWiki() {
    if (state.loaded || state.loading) return;
    state.loading = true;
    state.error = '';
    render();

    try {
      try {
        await loadWikiFromApi();
      } catch (apiError) {
        await loadWikiFromFiles();
      }

      state.loaded = true;
      state.loading = false;
      render();
    } catch (error) {
      state.loading = false;
      state.error = 'De wiki kon niet geladen worden vanuit de markdown-bronnen.';
      render();
    }
  }

  function lockBodyScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function openModal() {
    closeOtherSiteModals();
    refs.modal.classList.add('open');
    refs.modal.setAttribute('aria-hidden', 'false');
    lockBodyScroll(true);
    state.activePanel = 'index';
    render();
    updateHash();
    loadWiki().then(() => {
      if (!state.currentSlug) {
        refs.searchInput.focus();
      }
    });
  }

  function closeModal() {
    refs.modal.classList.remove('open');
    refs.modal.setAttribute('aria-hidden', 'true');
    state.currentSlug = null;
    state.activePanel = 'index';
    state.activeTab = 'description';
    state.query = '';
    state.backStack = [];
    state.forwardStack = [];
    lockBodyScroll(false);
    render();
    updateHash();
  }

  function navigateTo(slug, options) {
    const settings = options || {};
    const item = getItem(slug);
    if (!item) return;

    if (settings.pushHistory !== false && state.currentSlug && state.currentSlug !== slug) {
      state.backStack.push(state.currentSlug);
    }

    if (settings.resetForward !== false) {
      state.forwardStack = [];
    }

    state.currentSlug = slug;
    state.activePanel = 'item';
    state.activeTab = settings.tab || 'description';
    render();
    updateHash();

    if (refs.itemView) {
      refs.itemView.scrollTop = 0;
    }
  }

  function navigateBack() {
    if (!state.backStack.length) return;

    const previous = state.backStack.pop();
    if (state.currentSlug) {
      state.forwardStack.push(state.currentSlug);
    }
    state.currentSlug = previous;
    state.activePanel = 'item';
    state.activeTab = 'description';
    render();
    updateHash();

    if (refs.itemView) {
      refs.itemView.scrollTop = 0;
    }
  }

  function navigateForward() {
    if (!state.forwardStack.length) return;

    const next = state.forwardStack.pop();
    if (state.currentSlug) {
      state.backStack.push(state.currentSlug);
    }
    state.currentSlug = next;
    state.activePanel = 'item';
    state.activeTab = 'description';
    render();
    updateHash();

    if (refs.itemView) {
      refs.itemView.scrollTop = 0;
    }
  }

  function makeChip(label) {
    return `<span class="wiki-chip">${Core.escapeHtml(label)}</span>`;
  }

  function makeLinkButton(slug, label) {
    return `<button type="button" class="wiki-link-pill" data-item-slug="${Core.escapeHtml(slug)}">${Core.escapeHtml(label)}</button>`;
  }

  function groupItemsByLetter(items) {
    const groups = new Map();

    items.forEach((item) => {
      const letter = Core.getInitialLetter(item.title);
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }

      groups.get(letter).push(item);
    });

    return Array.from(groups.entries())
      .sort((left, right) => {
        if (left[0] === right[0]) return 0;
        if (left[0] === '#') return 1;
        if (right[0] === '#') return -1;
        return left[0].localeCompare(right[0], 'nl');
      })
      .map(([letter, letterItems]) => ({
        letter,
        items: letterItems.slice().sort((left, right) => left.title.localeCompare(right.title, 'nl'))
      }));
  }

  function renderDirectoryItem(item) {
    const isActive = state.currentSlug === item.slug && state.activePanel === 'item';
    const description = item.summary || 'Nog geen samenvatting toegevoegd.';

    return `
      <button
        type="button"
        class="wiki-directory-item ${isActive ? 'active' : ''}"
        data-item-slug="${Core.escapeHtml(item.slug)}"
        aria-current="${isActive ? 'true' : 'false'}"
      >
        <span class="wiki-directory-item-title">${Core.escapeHtml(item.title)}</span>
        <span class="wiki-directory-item-summary">${Core.escapeHtml(description)}</span>
        <span class="wiki-directory-item-meta">${item.resolvedLinks.length} links · ${item.backlinks.length} backlinks</span>
      </button>
    `;
  }

  function renderDirectory() {
    if (!state.loaded) {
      refs.indexView.innerHTML = `<div class="wiki-empty">${Core.escapeHtml(state.error || 'Wiki wordt geladen...')}</div>`;
      return;
    }

    const items = getDirectoryItems();

    if (!items.length) {
      refs.indexView.innerHTML = '<div class="wiki-empty">Geen wiki-items gevonden voor deze combinatie van zoekterm en filter.</div>';
      return;
    }

    if (state.query.trim()) {
      refs.indexView.innerHTML = `
        <div class="wiki-directory-shell">
          <p class="wiki-directory-note">${items.length} tref${items.length === 1 ? 'fer' : 'fers'} voor "${Core.escapeHtml(state.query.trim())}"</p>
          <div class="wiki-directory-results wiki-directory-results-flat">
            ${items.map((item) => renderDirectoryItem(item)).join('')}
          </div>
        </div>
      `;
      return;
    }

    const groups = groupItemsByLetter(items);

    refs.indexView.innerHTML = `
      <div class="wiki-directory-shell">
        <div class="wiki-letter-nav">
          ${groups.map((group) => `
            <button type="button" class="wiki-chip-btn wiki-letter-btn" data-letter-target="${Core.escapeHtml(group.letter)}">
              ${group.letter}
            </button>
          `).join('')}
        </div>
        <div class="wiki-directory-results">
          ${groups.map((group) => `
            <section class="wiki-letter-section" data-letter-section="${Core.escapeHtml(group.letter)}">
              <h4 class="wiki-letter-heading">${group.letter}</h4>
              <div class="wiki-directory-list">
                ${group.items.map((item) => renderDirectoryItem(item)).join('')}
              </div>
            </section>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderLanding() {
    refs.itemView.innerHTML = `
      <div class="wiki-empty">Kies links een item uit het woordenboek.</div>
    `;
  }

  function renderDescriptionTab(item) {
    const articleHtml = item.articleHtml || item.bodyHtml || '<p>Nog geen beschrijving toegevoegd.</p>';

    return `<article class="wiki-item-copy wiki-article-copy">${articleHtml}</article>`;
  }

  function renderLinksTab(item) {
    const resolved = item.resolvedLinks.length
      ? item.resolvedLinks.map((entry) => `<li>${makeLinkButton(entry.slug, entry.title)}<span class="wiki-link-list-label">${Core.escapeHtml(entry.term)}</span></li>`).join('')
      : '<div class="wiki-empty">Nog geen opgeloste links vanuit dit item.</div>';

    const broken = item.brokenLinks.length
      ? `<ul class="wiki-link-list">${item.brokenLinks.map((entry) => `<li><span class="wiki-link-pill-broken">${Core.escapeHtml(entry.term)}</span></li>`).join('')}</ul>`
      : '<div class="wiki-empty">Geen broken links.</div>';

    return `
      <div class="wiki-item-grid">
        <section class="wiki-panel-card">
          <h3>Outgoing links</h3>
          ${typeof resolved === 'string' && resolved.startsWith('<div') ? resolved : `<ul class="wiki-link-list">${resolved}</ul>`}
        </section>
        <section class="wiki-panel-card">
          <h3>Linktermen zonder item</h3>
          ${broken}
        </section>
      </div>
    `;
  }

  function renderMentionsTab(item) {
    const backlinks = item.backlinks.length
      ? item.backlinks.map((entry) => `<li>${makeLinkButton(entry.slug, entry.title)}<span class="wiki-link-list-label">${Core.escapeHtml(entry.via)}</span></li>`).join('')
      : '';

    const mentions = item.mentions
      .filter((entry, index, collection) => collection.findIndex((candidate) => candidate.slug === entry.slug) === index)
      .filter((entry) => entry.slug !== item.slug)
      .map((entry) => `<li>${makeLinkButton(entry.slug, entry.title)}</li>`)
      .join('');

    return `
      <div class="wiki-item-grid">
        <section class="wiki-panel-card">
          <h3>Backlinks</h3>
          ${backlinks ? `<ul class="wiki-link-list">${backlinks}</ul>` : '<div class="wiki-empty">Nog geen backlinks naar dit item.</div>'}
        </section>
        <section class="wiki-panel-card">
          <h3>Mentions</h3>
          ${mentions ? `<ul class="wiki-link-list">${mentions}</ul>` : '<div class="wiki-empty">Nog geen extra vermeldingen gevonden.</div>'}
        </section>
      </div>
    `;
  }

  function renderItem() {
    const item = currentItem();
    if (!item) {
      renderLanding();
      return;
    }

    const tabs = [
      { value: 'description', label: 'Description' },
      { value: 'links', label: 'Links' },
      { value: 'mentions', label: 'Mentions' }
    ];

    let panelMarkup = '';

    if (state.activeTab === 'links') {
      panelMarkup = renderLinksTab(item);
    } else if (state.activeTab === 'mentions') {
      panelMarkup = renderMentionsTab(item);
    } else {
      panelMarkup = renderDescriptionTab(item);
    }

    refs.itemView.innerHTML = `
      <article class="wiki-article-shell">
        <header class="wiki-article-header">
          <p class="wiki-kicker">Wiki item</p>
          <h2 class="wiki-headline">${Core.escapeHtml(item.title)}</h2>
          <p class="wiki-article-lead">${Core.escapeHtml(item.summary || 'Nog geen samenvatting toegevoegd.')}</p>
        </header>
        <div class="wiki-tab-row">
          ${tabs.map((tab) => `
            <button type="button" class="wiki-tab-btn ${state.activeTab === tab.value ? 'active' : ''}" data-tab-value="${tab.value}">
              ${tab.label}
            </button>
          `).join('')}
        </div>
        <div class="wiki-tab-panel">${panelMarkup}</div>
      </article>
    `;
  }

  function renderStatus() {
    if (state.error) {
      refs.status.textContent = state.error;
      return;
    }

    if (!state.loaded) {
      refs.status.textContent = 'Wiki wordt geladen uit markdown-bestanden.';
      return;
    }

    const count = getDirectoryItems().length;
    refs.status.textContent = `${count} item${count === 1 ? '' : 's'}`;
  }

  function render() {
    refs.backBtn.disabled = state.backStack.length === 0;
    refs.forwardBtn.disabled = state.forwardStack.length === 0;
    refs.searchInput.value = state.query;
    renderStatus();
    renderDirectory();

    if (state.activePanel === 'item' && currentItem()) {
      renderItem();
    } else {
      renderLanding();
    }
  }

  async function applyHashRoute() {
    if (syncingHash) return;

    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash || !hash.startsWith('wiki')) return;

    if (!refs.modal.classList.contains('open')) {
      closeOtherSiteModals();
      refs.modal.classList.add('open');
      refs.modal.setAttribute('aria-hidden', 'false');
      lockBodyScroll(true);
    }

    await loadWiki();

    if (hash.startsWith('wiki:')) {
      const targetSlug = hash.slice('wiki:'.length).trim();
      if (getItem(targetSlug)) {
        state.currentSlug = targetSlug;
        state.activePanel = 'item';
        state.activeTab = 'description';
      } else {
        state.activePanel = 'index';
      }
    } else {
      state.activePanel = 'index';
    }

    render();
  }

  refs.trigger.addEventListener('click', openModal);
  refs.closeBtn.addEventListener('click', closeModal);
  refs.backBtn.addEventListener('click', navigateBack);
  refs.forwardBtn.addEventListener('click', navigateForward);
  refs.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    render();
  });

  refs.content.addEventListener('click', (event) => {
    const itemButton = event.target.closest('[data-item-slug]');
    if (itemButton) {
      navigateTo(itemButton.getAttribute('data-item-slug'));
      return;
    }

    const tabButton = event.target.closest('[data-tab-value]');
    if (tabButton) {
      state.activeTab = tabButton.getAttribute('data-tab-value');
      render();
      return;
    }

    const wikiLink = event.target.closest('[data-wiki-slug]');
    if (wikiLink) {
      event.preventDefault();
      navigateTo(wikiLink.getAttribute('data-wiki-slug'));
      return;
    }

    const letterButton = event.target.closest('[data-letter-target]');
    if (letterButton) {
      const target = letterButton.getAttribute('data-letter-target');
      const section = Array.from(refs.indexView.querySelectorAll('[data-letter-section]'))
        .find((entry) => entry.getAttribute('data-letter-section') === target);
      if (section) {
        section.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  });

  refs.modal.addEventListener('click', (event) => {
    if (event.target === refs.modal) closeModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !refs.modal.classList.contains('open')) return;
    closeModal();
  });

  render();
  applyHashRoute();
  window.addEventListener('hashchange', applyHashRoute);
})();
