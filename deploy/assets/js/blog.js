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
  const cards = [...grid.querySelectorAll('.post-card')];
  if (!cards.length) return;

  const pageSize = 12;
  let currentPage = 1;
  const collator = new Intl.Collator(localeByLanguage[language], { sensitivity: 'base' });

  const pagination = document.createElement('nav');
  pagination.className = 'archive-pagination';
  pagination.dataset.archivePagination = '';
  pagination.setAttribute('aria-label', labels.pagination);
  grid.after(pagination);

  [...new Set(cards.map((card) => card.dataset.category))]
    .sort(collator.compare)
    .forEach((categoryName) => category.add(new Option(categoryName, categoryName)));
  category.options[0].textContent = labels.allCategories;

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
      if (field === 'date') return firstCard.dataset.date.localeCompare(secondCard.dataset.date) * direction;
      return collator.compare(firstCard.dataset[field], secondCard.dataset[field]) * direction;
    });

    const matchingCards = sortedCards.filter((card) => {
      const matchesSearch = !query || card.dataset.search.includes(query);
      const matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

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

  [search, category, sortField, sortDirection].forEach((control) =>
    control.addEventListener(control === search ? 'input' : 'change', () => updateArchive(true))
  );

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    currentPage = Number(button.dataset.page);
    updateArchive();
    archive.querySelector('.section-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  updateArchive();
  archive.classList.add('is-ready');
})();
