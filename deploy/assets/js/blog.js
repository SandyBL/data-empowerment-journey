/**
 * Progressive enhancement for the blog archive.
 *
 * Article cards are rendered statically at build time so crawlers (and users
 * without JavaScript) get real links and real text. This script only adds the
 * search, filter, sort, and pagination behaviour on top of that markup.
 */
(() => {
  const archive = document.querySelector('[data-article-archive]');
  if (!archive) return;

  const language = document.body.dataset.lang || document.documentElement.lang || 'en';
  const localeByLanguage = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };
  const labels = {
    en: { allCategories: 'All categories', result: 'article', results: 'articles', previous: '← Previous', next: 'Next →', pagination: 'Article archive pages' },
    es: { allCategories: 'Todas las categorías', result: 'artículo', results: 'artículos', previous: '← Anterior', next: 'Siguiente →', pagination: 'Páginas del archivo de artículos' },
    pt: { allCategories: 'Todas as categorias', result: 'artigo', results: 'artigos', previous: '← Anterior', next: 'Próxima →', pagination: 'Páginas do arquivo de artigos' }
  }[language] || {};

  const normalizeText = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const grid = archive.querySelector('[data-archive-grid]');
  const search = archive.querySelector('[data-archive-search]');
  const category = archive.querySelector('[data-archive-category]');
  const sortField = archive.querySelector('[data-archive-sort]');
  const sortDirection = archive.querySelector('[data-archive-direction]');
  const count = archive.querySelector('[data-archive-count]');
  const emptyState = archive.querySelector('[data-archive-empty]');

  // Every control above is written by the build script, so all seven are
  // normally present. If one ever is not, the first dereference throws and the
  // script dies partway through — after it has appended the pagination bar but
  // before it can hide or page anything, leaving a half-enhanced archive.
  // Bailing out here leaves the statically rendered cards exactly as the server
  // sent them: every article still visible, every link still followable.
  if (!grid || !search || !category || !sortField || !sortDirection || !count || !emptyState) return;

  const cards = [...grid.querySelectorAll('.post-card')];
  if (!cards.length) return;

  const pageSize = 12;
  let currentPage = 1;
  const collator = new Intl.Collator(localeByLanguage[language], { sensitivity: 'base' });

  /**
   * Full article text for searching, fetched once on first use.
   *
   * It used to be inlined into every card as a data-search attribute, which put
   * the entire archive's prose into the page source: invisible to readers, and
   * to a crawler indistinguishable from the page's own content. Fetching it only
   * when someone actually types keeps the markup to what the page really says.
   */
  let corpus = null;
  let corpusRequest = null;
  const loadCorpus = () => {
    if (corpus) return Promise.resolve(corpus);
    corpusRequest ||= fetch(`/assets/search/${language}.json`)
      .then((response) => (response.ok ? response.json() : {}))
      // A failed fetch degrades to title-and-category search rather than to a
      // search box that silently returns nothing.
      .catch(() => ({}))
      .then((loaded) => (corpus = loaded));
    return corpusRequest;
  };

  const searchableText = (card) => {
    const fullText = corpus?.[card.dataset.slug];
    const heading = normalizeText(`${card.dataset.title} ${card.dataset.category}`);
    return fullText ? `${heading} ${fullText}` : heading;
  };

  const pagination = document.createElement('nav');
  pagination.className = 'archive-pagination';
  pagination.dataset.archivePagination = '';
  pagination.setAttribute('aria-label', labels.pagination);
  grid.after(pagination);

  // The dropdown is populated from the cards rather than from a list written
  // into the page, so it can never offer a category the archive has no article
  // for. Each option carries the language-neutral key as its value and the
  // localized label as its text: the key is what a ?category= link from the
  // category nav arrives with, the label is what the reader picks from.
  const categoryLabels = new Map();
  cards.forEach((card) => {
    const key = card.dataset.categoryKey || card.dataset.category;
    if (key && !categoryLabels.has(key)) categoryLabels.set(key, card.dataset.category);
  });
  [...categoryLabels]
    .sort(([, firstLabel], [, secondLabel]) => collator.compare(firstLabel, secondLabel))
    .forEach(([key, label]) => category.add(new Option(label, key)));
  if (category.options.length) category.options[0].textContent = labels.allCategories;

  // A category with a hub page of its own answers a click by navigating there,
  // and that page highlights the category in the row above and carries no
  // featured article over its list. The categories without a hub filter this
  // page instead, so the same two things have to happen here: without them the
  // reader clicked a filter and got a row still highlighting "All articles"
  // above a featured article the filter had plainly not touched, and only the
  // list at the bottom of the page responded.
  //
  // The featured article is a second rendering of a card that is also in the
  // grid, so hiding it removes nothing from the results or the count.
  const featured = document.querySelector('[data-featured-article]');
  const categoryChips = [...document.querySelectorAll('.category-nav-links [data-category-key]')];
  const syncCategoryChrome = (selectedCategory) => {
    if (featured) featured.hidden = Boolean(selectedCategory);
    categoryChips.forEach((chip) => {
      if (chip.dataset.categoryKey === selectedCategory) chip.setAttribute('aria-current', 'page');
      else chip.removeAttribute('aria-current');
    });
  };

  const renderPagination = (pageCount) => {
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    const createButton = (text, page, className = '') => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `pagination-button ${className}`.trim();
      button.textContent = text;
      button.dataset.page = page;
      if (page === currentPage) {
        button.classList.add('is-current');
        button.setAttribute('aria-current', 'page');
      }
      return button;
    };

    if (currentPage > 1) pagination.append(createButton(labels.previous, currentPage - 1, 'pagination-direction'));
    for (let page = 1; page <= pageCount; page += 1) pagination.append(createButton(String(page), page));
    if (currentPage < pageCount) pagination.append(createButton(labels.next, currentPage + 1, 'pagination-direction'));
  };

  const updateArchive = (resetPage = false) => {
    if (resetPage) currentPage = 1;
    const query = normalizeText(search.value.trim());
    const selectedCategory = category.value;
    const direction = sortDirection.value === 'asc' ? 1 : -1;
    const field = sortField.value;

    const sortedCards = [...cards].sort((firstCard, secondCard) => {
      if (field === 'date') return (firstCard.dataset.date || '').localeCompare(secondCard.dataset.date || '') * direction;
      return collator.compare(firstCard.dataset[field] || '', secondCard.dataset[field] || '') * direction;
    });

    const matchingCards = sortedCards.filter((card) => {
      const matchesSearch = !query || searchableText(card).includes(query);
      const matchesCategory =
        !selectedCategory ||
        (card.dataset.categoryKey || card.dataset.category) === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    syncCategoryChrome(selectedCategory);

    const pageCount = Math.max(1, Math.ceil(matchingCards.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const firstCardIndex = (currentPage - 1) * pageSize;
    const pagedCards = new Set(matchingCards.slice(firstCardIndex, firstCardIndex + pageSize));

    sortedCards.forEach((card) => {
      card.hidden = !pagedCards.has(card);
      grid.append(card);
    });

    const resultCount = matchingCards.length;
    count.textContent = `${resultCount} ${resultCount === 1 ? labels.result : labels.results}`;
    emptyState.hidden = resultCount !== 0;
    renderPagination(pageCount);
  };

  // Each keystroke re-sorts every card and, once the full-text corpus has
  // landed, scans the whole archive's prose for the query — typing a six-letter
  // word ran that six times over. A short debounce collapses a burst of typing
  // into a single pass; the dropdowns fire one event per choice, so they stay
  // immediate.
  let searchTimer = 0;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => updateArchive(true), 150);
  });

  [category, sortField, sortDirection].forEach((control) =>
    control.addEventListener('change', () => updateArchive(true))
  );

  // Warm the corpus on the first keystroke and re-run once it lands, so an early
  // query is not judged on titles alone.
  search.addEventListener('input', () => {
    if (corpus) return;
    loadCorpus().then(() => updateArchive());
  });

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    currentPage = Number(button.dataset.page);
    updateArchive();
    archive.querySelector('.section-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // A shared link — or a result from the sitelinks searchbox Google builds from
  // the site's SearchAction — arrives as ?q=… . The archive's search runs
  // entirely in the browser, so nothing read that parameter and the visitor
  // landed on an unfiltered list wondering where their query went.
  //
  // ?category=… arrives the same way, from the "Browse by category" row above:
  // the categories deep enough to have a hub page of their own link to it, and
  // the rest come back here with their filter named. An unknown key is ignored
  // rather than emptying the archive over a stale link.
  const parameters = new URLSearchParams(window.location.search);
  const initialQuery = parameters.get('q');
  if (initialQuery) search.value = initialQuery;

  const initialCategory = parameters.get('category');
  if (initialCategory && [...category.options].some((option) => option.value === initialCategory)) {
    category.value = initialCategory;
  }

  updateArchive();
  // Titles and categories match immediately; the full-text corpus refines the
  // result as soon as it lands.
  if (initialQuery) loadCorpus().then(() => updateArchive(true));
  archive.classList.add('is-ready');
})();
