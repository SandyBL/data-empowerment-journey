(() => {
  const language = document.body.dataset.lang || document.documentElement.lang || 'en';
  const productionOrigin = 'https://datagovjourney.com';
  const localeByLanguage = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };
  const labels = {
    en: { minRead: 'min read', error: 'This article could not be loaded.', toc: 'On this page', leadTitle: 'Put this into practice', leadText: 'Use our free data governance tools to turn the ideas in this article into action.', leadLink: 'Explore the tools →', allCategories: 'All categories', result: 'article', results: 'articles', previous: '← Previous', next: 'Next →', pagination: 'Article archive pages' },
    es: { minRead: 'min de lectura', error: 'No se pudo cargar este artículo.', toc: 'En esta página', leadTitle: 'Lleva esto a la práctica', leadText: 'Usa nuestras herramientas gratuitas de gobierno de datos para convertir estas ideas en acción.', leadLink: 'Explorar las herramientas →', allCategories: 'Todas las categorías', result: 'artículo', results: 'artículos', previous: '← Anterior', next: 'Siguiente →', pagination: 'Páginas del archivo de artículos' },
    pt: { minRead: 'min de leitura', error: 'Não foi possível carregar este artigo.', toc: 'Nesta página', leadTitle: 'Coloque isso em prática', leadText: 'Use nossas ferramentas gratuitas de governança de dados para transformar estas ideias em ação.', leadLink: 'Explorar as ferramentas →', allCategories: 'Todas as categorias', result: 'artigo', results: 'artigos', previous: '← Anterior', next: 'Próxima →', pagination: 'Páginas do arquivo de artigos' }
  };

  const cleanValue = (value) => {
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
    return trimmed;
  };

  const parseMarkdown = (source) => {
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { attributes: {}, body: source };
    const attributes = {};
    let currentKey = '';
    match[1].split('\n').forEach((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) {
        if (currentKey && /^\s+/.test(line)) attributes[currentKey] = `${attributes[currentKey]} ${line.trim()}`;
        return;
      }
      currentKey = line.slice(0, separator).trim();
      attributes[currentKey] = cleanValue(line.slice(separator + 1));
    });
    return { attributes, body: match[2] };
  };

  const createArchiveCard = (postPath) => {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.postPath = postPath;
    card.innerHTML = '<span class="post-category" data-post-category></span><h2><a data-post-link data-post-title href="#"></a></h2><p data-post-summary></p><div class="post-meta"><span data-post-date></span><span data-post-read></span></div>';
    return card;
  };

  const fetchPost = async (path) => {
    const response = await fetch(path, { headers: { Accept: 'text/markdown' } });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return parseMarkdown(await response.text());
  };

  const formatDate = (date) => new Intl.DateTimeFormat(localeByLanguage[language], { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const readingTime = (body) => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210));
  const articleUrl = (slug) => `/${language}/blog/article.html?post=${encodeURIComponent(slug)}`;
  const normalizeText = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const populateCard = async (card) => {
    try {
      const post = await fetchPost(card.dataset.postPath);
      const slug = card.dataset.postPath.split('/').pop().replace(/\.md$/, '');
      const link = articleUrl(slug);
      card.querySelectorAll('[data-post-link]').forEach((element) => { element.href = link; });
      card.querySelector('[data-post-title]').textContent = post.attributes.title;
      card.querySelector('[data-post-summary]').textContent = post.attributes.summary;
      card.querySelector('[data-post-category]').textContent = post.attributes.category;
      card.querySelector('[data-post-date]').textContent = formatDate(post.attributes.date);
      card.querySelector('[data-post-read]').textContent = `${readingTime(post.body)} ${labels[language].minRead}`;
      card.dataset.title = post.attributes.title;
      card.dataset.category = post.attributes.category;
      card.dataset.date = post.attributes.date;
      card.dataset.search = normalizeText(`${post.attributes.title} ${post.attributes.category} ${post.attributes.summary} ${post.body}`);
      card.classList.add('is-loaded');
    } catch {
      card.hidden = true;
    }
  };

  const initializeArchive = async (cards) => {
    const archive = document.querySelector('[data-article-archive]');
    if (!archive) return;
    await Promise.all(cards.map(populateCard));

    const grid = archive.querySelector('[data-archive-grid]');
    const search = archive.querySelector('[data-archive-search]');
    const category = archive.querySelector('[data-archive-category]');
    const sortField = archive.querySelector('[data-archive-sort]');
    const sortDirection = archive.querySelector('[data-archive-direction]');
    const count = archive.querySelector('[data-archive-count]');
    const emptyState = archive.querySelector('[data-archive-empty]');
    const pageSize = 12;
    let currentPage = 1;
    const collator = new Intl.Collator(localeByLanguage[language], { sensitivity: 'base' });
    const availableCards = cards.filter((card) => !card.hidden);
    const pagination = document.createElement('nav');
    pagination.className = 'archive-pagination';
    pagination.dataset.archivePagination = '';
    pagination.setAttribute('aria-label', labels[language].pagination);
    grid.after(pagination);

    [...new Set(availableCards.map((card) => card.dataset.category))]
      .sort(collator.compare)
      .forEach((categoryName) => category.add(new Option(categoryName, categoryName)));

    category.options[0].textContent = labels[language].allCategories;

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

      if (currentPage > 1) pagination.append(createButton(labels[language].previous, currentPage - 1, 'pagination-direction'));
      for (let page = 1; page <= pageCount; page += 1) pagination.append(createButton(String(page), page));
      if (currentPage < pageCount) pagination.append(createButton(labels[language].next, currentPage + 1, 'pagination-direction'));
    };

    const updateArchive = (resetPage = false) => {
      if (resetPage) currentPage = 1;
      const query = normalizeText(search.value.trim());
      const selectedCategory = category.value;
      const direction = sortDirection.value === 'asc' ? 1 : -1;
      const field = sortField.value;
      const sortedCards = [...availableCards].sort((firstCard, secondCard) => {
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
      count.textContent = `${resultCount} ${resultCount === 1 ? labels[language].result : labels[language].results}`;
      emptyState.hidden = resultCount !== 0;
      renderPagination(pageCount);
    };

    [search, category, sortField, sortDirection].forEach((control) => control.addEventListener(control === search ? 'input' : 'change', () => updateArchive(true)));
    pagination.addEventListener('click', (event) => {
      const button = event.target.closest('[data-page]');
      if (!button) return;
      currentPage = Number(button.dataset.page);
      updateArchive();
      archive.querySelector('.section-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    updateArchive();
    archive.classList.add('is-ready');
  };

  const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const buildTableOfContents = (articleBody) => {
    const headings = [...articleBody.querySelectorAll('h2, h3')];
    const list = document.querySelector('[data-toc-list]');
    if (!list || !headings.length) return;
    headings.forEach((heading) => {
      heading.id = heading.id || slugify(heading.textContent);
      const item = document.createElement('li');
      item.className = heading.tagName === 'H3' ? 'toc-subitem' : '';
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      item.append(link);
      list.append(item);
    });
  };

  const insertLeadMagnet = (articleBody) => {
    const paragraphs = articleBody.querySelectorAll('p');
    const anchor = paragraphs[Math.min(3, paragraphs.length - 1)];
    if (!anchor) return;
    const box = document.createElement('aside');
    box.className = 'article-lead-magnet';
    box.setAttribute('aria-label', labels[language].leadTitle);
    box.innerHTML = `<span>FIELD NOTE / 01</span><h2>${labels[language].leadTitle}</h2><p>${labels[language].leadText}</p><a href="/#recursos">${labels[language].leadLink}</a>`;
    anchor.after(box);
  };

  const setMeta = (selector, attribute, value) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  };

  const renderArticle = async () => {
    const articleBody = document.querySelector('[data-article-body]');
    if (!articleBody) return;
    const requestedSlug = new URLSearchParams(window.location.search).get('post') || 'building-a-data-governance-operating-model';
    const slug = /^[a-z0-9-]+$/.test(requestedSlug) ? requestedSlug : 'building-a-data-governance-operating-model';
    try {
      const post = await fetchPost(`/content/blog/${language}/${slug}.md`);
      const canonicalUrl = `${productionOrigin}/${language}/blog/article.html?post=${slug}`;
      document.title = `${post.attributes.title} | Data Governance Journey`;
      document.querySelector('[data-article-title]').textContent = post.attributes.title;
      document.querySelector('[data-article-summary]').textContent = post.attributes.summary;
      document.querySelector('[data-article-category]').textContent = post.attributes.category;
      document.querySelector('[data-article-date]').textContent = formatDate(post.attributes.date);
      document.querySelector('[data-article-read]').textContent = `${readingTime(post.body)} ${labels[language].minRead}`;
      document.querySelector('[data-article-author]').textContent = post.attributes.author;
      const renderedMarkdown = window.marked.parse(post.body);
      const sanitizedMarkdown = window.DOMPurify ? window.DOMPurify.sanitize(renderedMarkdown) : renderedMarkdown;
      const articleTemplate = document.createElement('template');
      articleTemplate.innerHTML = sanitizedMarkdown;
      articleTemplate.content.querySelectorAll('img, picture, figure').forEach((element) => element.remove());
      articleBody.replaceChildren(articleTemplate.content.cloneNode(true));
      document.querySelector('[data-toc-title]').textContent = labels[language].toc;
      buildTableOfContents(articleBody);
      insertLeadMagnet(articleBody);
      setMeta('meta[name="description"]', 'content', post.attributes.summary);
      setMeta('meta[property="og:title"]', 'content', post.attributes.title);
      setMeta('meta[property="og:description"]', 'content', post.attributes.summary);
      setMeta('meta[property="og:url"]', 'content', canonicalUrl);
      setMeta('meta[name="twitter:title"]', 'content', `${post.attributes.title} | Data Governance Journey`);
      setMeta('meta[name="twitter:description"]', 'content', post.attributes.summary);
      setMeta('link[rel="canonical"]', 'href', canonicalUrl);
      document.querySelectorAll('link[rel="alternate"]').forEach((link) => {
        const hreflang = link.getAttribute('hreflang');
        const targetLanguage = hreflang === 'x-default' ? 'en' : hreflang;
        link.href = `${productionOrigin}/${targetLanguage}/blog/article.html?post=${slug}`;
      });
      document.querySelectorAll('.language-nav a').forEach((link) => {
        const targetLanguage = link.pathname.split('/').filter(Boolean)[0];
        if (['en', 'es', 'pt'].includes(targetLanguage)) link.href = `/${targetLanguage}/blog/article.html?post=${slug}`;
      });
      const schema = document.querySelector('#article-schema');
      if (schema) schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.attributes.title, description: post.attributes.summary, datePublished: post.attributes.date, author: { '@type': 'Person', name: post.attributes.author }, mainEntityOfPage: canonicalUrl });
      document.body.classList.add('article-ready');
    } catch {
      articleBody.innerHTML = `<p class="article-error">${labels[language].error}</p>`;
    }
  };

  const archiveGrid = document.querySelector('[data-archive-grid]');
  const indexedPosts = window.blogArticleIndex?.[language] || [];
  const archiveCards = indexedPosts.map(createArchiveCard);
  archiveCards.forEach((card) => archiveGrid?.append(card));
  document.querySelectorAll('.hero-post[data-post-path]').forEach(populateCard);
  initializeArchive(archiveCards);
  renderArticle();
})();
