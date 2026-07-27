(() => {
  const language = document.body.dataset.lang || document.documentElement.lang || 'en';
  const localeByLanguage = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };
  const labels = {
    en: { minRead: 'min read', error: 'This article could not be loaded.', toc: 'On this page', leadTitle: 'Put this into practice', leadText: 'Use our free data governance tools to turn the ideas in this article into action.', leadLink: 'Explore the tools →' },
    es: { minRead: 'min de lectura', error: 'No se pudo cargar este artículo.', toc: 'En esta página', leadTitle: 'Lleva esto a la práctica', leadText: 'Usa nuestras herramientas gratuitas de gobierno de datos para convertir estas ideas en acción.', leadLink: 'Explorar las herramientas →' },
    pt: { minRead: 'min de leitura', error: 'Não foi possível carregar este artigo.', toc: 'Nesta página', leadTitle: 'Coloque isso em prática', leadText: 'Use nossas ferramentas gratuitas de governança de dados para transformar estas ideias em ação.', leadLink: 'Explorar as ferramentas →' }
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
    match[1].split('\n').forEach((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) return;
      attributes[line.slice(0, separator).trim()] = cleanValue(line.slice(separator + 1));
    });
    return { attributes, body: match[2] };
  };

  const fetchPost = async (path) => {
    const response = await fetch(path, { headers: { Accept: 'text/markdown' } });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return parseMarkdown(await response.text());
  };

  const formatDate = (date) => new Intl.DateTimeFormat(localeByLanguage[language], { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const readingTime = (body) => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210));
  const articleUrl = (slug) => `/${language}/blog/article.html?post=${encodeURIComponent(slug)}`;

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
      const image = card.querySelector('[data-post-image]');
      image.src = post.attributes.featured_image;
      image.alt = '';
      card.classList.add('is-loaded');
    } catch {
      card.hidden = true;
    }
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
      const canonicalUrl = `${window.location.origin}/${language}/blog/article.html?post=${slug}`;
      document.title = `${post.attributes.title} | The Data Empowerment Journey`;
      document.querySelector('[data-article-title]').textContent = post.attributes.title;
      document.querySelector('[data-article-summary]').textContent = post.attributes.summary;
      document.querySelector('[data-article-category]').textContent = post.attributes.category;
      document.querySelector('[data-article-date]').textContent = formatDate(post.attributes.date);
      document.querySelector('[data-article-read]').textContent = `${readingTime(post.body)} ${labels[language].minRead}`;
      document.querySelector('[data-article-author]').textContent = post.attributes.author;
      const image = document.querySelector('[data-article-image]');
      image.src = post.attributes.featured_image;
      image.alt = post.attributes.title;
      const renderedMarkdown = window.marked.parse(post.body);
      articleBody.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(renderedMarkdown) : renderedMarkdown;
      document.querySelector('[data-toc-title]').textContent = labels[language].toc;
      buildTableOfContents(articleBody);
      insertLeadMagnet(articleBody);
      setMeta('meta[name="description"]', 'content', post.attributes.summary);
      setMeta('meta[property="og:title"]', 'content', post.attributes.title);
      setMeta('meta[property="og:description"]', 'content', post.attributes.summary);
      setMeta('meta[property="og:image"]', 'content', new URL(post.attributes.featured_image, window.location.origin).href);
      setMeta('meta[property="og:url"]', 'content', canonicalUrl);
      setMeta('link[rel="canonical"]', 'href', canonicalUrl);
      document.querySelectorAll('link[rel="alternate"]').forEach((link) => {
        const hreflang = link.getAttribute('hreflang');
        const targetLanguage = hreflang === 'x-default' ? 'en' : hreflang;
        link.href = `${window.location.origin}/${targetLanguage}/blog/article.html?post=${slug}`;
      });
      document.querySelectorAll('.language-nav a').forEach((link) => {
        const targetLanguage = link.pathname.split('/').filter(Boolean)[0];
        if (['en', 'es', 'pt'].includes(targetLanguage)) link.href = `/${targetLanguage}/blog/article.html?post=${slug}`;
      });
      const schema = document.querySelector('#article-schema');
      if (schema) schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.attributes.title, description: post.attributes.summary, datePublished: post.attributes.date, author: { '@type': 'Person', name: post.attributes.author }, image: new URL(post.attributes.featured_image, window.location.origin).href, mainEntityOfPage: canonicalUrl });
      document.body.classList.add('article-ready');
    } catch {
      articleBody.innerHTML = `<p class="article-error">${labels[language].error}</p>`;
    }
  };

  document.querySelectorAll('[data-post-path]').forEach(populateCard);
  renderArticle();
})();
