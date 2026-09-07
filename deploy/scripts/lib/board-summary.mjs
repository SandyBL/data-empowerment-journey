/**
 * The public board summary, as markup.
 *
 * Rendered at build time and shipped as plain HTML with no script behind it.
 * That is a deliberate choice about what this page is for: it exists to be
 * found, quoted and cited, and a figure that only appears after JavaScript runs
 * is a figure an assistant summarising the page cannot see. The build fetches
 * the live aggregate on every deploy (see insights-snapshot.mjs), so the cost of
 * being static is that the numbers are as fresh as the last publish rather than
 * as fresh as the last run.
 *
 * The wording changes with the sample size and the arithmetic does not. Under
 * MIN_SAMPLE the bands are stated as counts and the section carries a note
 * saying why; over it, the same counts are also given as shares. A page on this
 * site cannot report "33% of practitioners" from three runs and keep any right
 * to the articles it links to.
 */

import { BAND_LABELS, BANDS, SIMULATOR_LABELS } from '../../assets/js/simulator-analysis.mjs';
import { MIN_SAMPLE } from '../../assets/js/public-board-analysis.mjs';
import { escapeHtml } from './markdown.mjs';

import { DATE_LOCALE } from './locales.mjs';

const COPY = {
  en: {
    heading: 'What the public boards currently show',
    runs: (total) => `${total} published ${total === 1 ? 'run' : 'runs'}`,
    updated: (date) => `Figures as of ${date}`,
    languages: 'Played in',
    indexLabel: 'All three boards combined',
    indexNote: 'The average published run, as a percentage of what its own simulator can award.',
    thin: `Read this as a list of the people who have played, not as a benchmark. Under ${MIN_SAMPLE} runs on a board, one person moving between bands shifts every share on the page by double digits — so the bands below are given as counts, and no percentage of "practitioners" is claimed. The numbers get more informative as the boards fill up.`,
    empty:
      'Nobody has published a run to the public boards yet. The lessons below come from the simulators’ own scoring design and from running them with real rooms; the figures will appear here as soon as there is a board to describe.',
    board: 'Board',
    best: 'Best run',
    median: 'Median run',
    spread: 'Best above median',
    time: 'Median time',
    untimed: 'Not timed',
    distribution: 'Where the runs fall',
    scale: (max) => `scored out of ${max}`,
    noRuns: 'No runs published yet',
    play: 'Play it',
    bandNote:
      'The four bands are the same on all three boards, so a run scored out of 15 and a run scored out of 1000 can sit in the same histogram.',
  },
  es: {
    heading: 'Lo que muestran ahora las clasificaciones públicas',
    runs: (total) => `${total} ${total === 1 ? 'partida publicada' : 'partidas publicadas'}`,
    updated: (date) => `Cifras a ${date}`,
    languages: 'Jugadas en',
    indexLabel: 'Las tres clasificaciones juntas',
    indexNote: 'La partida promedio publicada, como porcentaje de lo que su propio simulador puede otorgar.',
    thin: `Lee esto como la lista de quienes han jugado, no como un benchmark. Por debajo de ${MIN_SAMPLE} partidas en una clasificación, una sola persona que cambia de banda mueve cada porcentaje de la página en dos dígitos: por eso las bandas de abajo van en número de partidas y no se afirma ningún porcentaje de "profesionales". Los números serán más informativos a medida que se llenen las clasificaciones.`,
    empty:
      'Todavía nadie ha publicado una partida en las clasificaciones públicas. Las lecciones de abajo vienen del diseño de puntuación de los propios simuladores y de usarlos con salas reales; las cifras aparecerán aquí en cuanto haya una clasificación que describir.',
    board: 'Clasificación',
    best: 'Mejor partida',
    median: 'Partida mediana',
    spread: 'La mejor por encima de la mediana',
    time: 'Tiempo mediano',
    untimed: 'No se cronometra',
    distribution: 'Dónde caen las partidas',
    scale: (max) => `puntuada sobre ${max}`,
    noRuns: 'Sin partidas publicadas todavía',
    play: 'Jugar',
    bandNote:
      'Las cuatro bandas son las mismas en las tres clasificaciones, así que una partida puntuada sobre 15 y otra sobre 1000 pueden estar en el mismo histograma.',
  },
  pt: {
    heading: 'O que os rankings públicos mostram agora',
    runs: (total) => `${total} ${total === 1 ? 'partida publicada' : 'partidas publicadas'}`,
    updated: (date) => `Números em ${date}`,
    languages: 'Jogadas em',
    indexLabel: 'Os três rankings juntos',
    indexNote: 'A partida média publicada, como porcentagem do que o próprio simulador pode conceder.',
    thin: `Leia isto como a lista de quem já jogou, não como um benchmark. Abaixo de ${MIN_SAMPLE} partidas num ranking, uma única pessoa que muda de faixa move cada porcentagem da página em dois dígitos: por isso as faixas abaixo vão em número de partidas e nenhuma porcentagem de "profissionais" é afirmada. Os números ficam mais informativos conforme os rankings se enchem.`,
    empty:
      'Ninguém publicou uma partida nos rankings públicos ainda. As lições abaixo vêm do desenho de pontuação dos próprios simuladores e de usá-los com salas reais; os números aparecerão aqui assim que houver um ranking para descrever.',
    board: 'Ranking',
    best: 'Melhor partida',
    median: 'Partida mediana',
    spread: 'A melhor acima da mediana',
    time: 'Tempo mediano',
    untimed: 'Não é cronometrado',
    distribution: 'Onde caem as partidas',
    scale: (max) => `pontuada sobre ${max}`,
    noRuns: 'Sem partidas publicadas ainda',
    play: 'Jogar',
    bandNote:
      'As quatro faixas são as mesmas nos três rankings, então uma partida pontuada sobre 15 e outra sobre 1000 podem estar no mesmo histograma.',
  },
};

const LANGUAGE_NAMES = {
  en: { en: 'English', es: 'Spanish', pt: 'Portuguese' },
  es: { en: 'inglés', es: 'español', pt: 'portugués' },
  pt: { en: 'inglês', es: 'espanhol', pt: 'português' },
};

const formatDate = (iso, lang) =>
  new Date(iso).toLocaleDateString(DATE_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** Minutes and seconds, because every run here is between 20s and 10 minutes. */
const formatDuration = (ms, lang) => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return lang === 'en' ? `${seconds}s` : `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${String(rest).padStart(2, '0')}s`;
};

/*
 * Spanish and Portuguese write 84,6 rather than 84.6. These figures are the one
 * place on the page where a number carries the argument, so they go through the
 * locale the rest of the block already formats dates with.
 */
const number = (value, lang) =>
  Number(value).toLocaleString(DATE_LOCALE[lang], { maximumFractionDigits: 1 });

const percentText = (value, lang) => `${number(value, lang)}%`;

const figure = (label, value, note = '') =>
  `<div class="board-card__figure"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}${
    note ? `<small>${escapeHtml(note)}</small>` : ''
  }</dd></div>`;

/**
 * One board's histogram.
 *
 * The bar is scaled against the fullest band rather than against the total, so
 * the shape of a small board is still readable; the number beside it is the
 * count, which is the figure that does not mislead at any sample size.
 */
const renderBands = (board, copy, lang) => {
  const labels = BAND_LABELS[lang];
  const peak = Math.max(...BANDS.map((band) => board.bands[band.key] ?? 0), 1);

  const rows = BANDS.map((band) => {
    const count = board.bands[band.key] ?? 0;
    const share = board.runs ? Math.round((count / board.runs) * 100) : 0;
    const width = Math.round((count / peak) * 100);
    return `<li class="board-band"><span class="board-band__name">${escapeHtml(labels[band.key])}</span><span class="board-band__track"><span class="board-band__fill" style="width: ${width}%"></span></span><span class="board-band__count">${count}${
      board.confident ? ` <small>(${share}%)</small>` : ''
    }</span></li>`;
  }).join('');

  return `<div class="board-card__bands"><p class="board-card__bands-title">${escapeHtml(
    copy.distribution
  )}</p><ul class="board-bands">${rows}</ul></div>`;
};

const renderBoard = (board, copy, lang) => {
  const name = SIMULATOR_LABELS[lang][board.simulator] ?? board.simulator;
  const playHref = `/simulators/${lang}/${board.simulator}/`;

  if (!board.runs) {
    return `<article class="board-card board-card--empty"><h3>${escapeHtml(name)}</h3><p class="board-card__runs">${escapeHtml(
      copy.noRuns
    )}</p><p class="board-card__play"><a href="${playHref}">${escapeHtml(copy.play)}</a></p></article>`;
  }

  const figures = [
    figure(copy.best, percentText(board.best, lang)),
    figure(copy.median, percentText(board.median, lang)),
    figure(copy.spread, `+${number(board.spread, lang)} pp`),
    board.timedRuns
      ? figure(copy.time, formatDuration(board.medianDurationMs, lang))
      : figure(copy.time, copy.untimed),
  ].join('');

  return `<article class="board-card"><h3>${escapeHtml(name)}</h3><p class="board-card__runs">${escapeHtml(
    `${copy.runs(board.runs)} · ${copy.scale(board.maxScore)}`
  )}</p><dl class="board-card__figures">${figures}</dl>${renderBands(board, copy, lang)}<p class="board-card__play"><a href="${playHref}">${escapeHtml(
    copy.play
  )}</a></p></article>`;
};

/**
 * The whole block. `summary` is the payload from public-board-analysis.mjs.
 */
export const renderBoardSummary = (summary, lang) => {
  const copy = COPY[lang];
  const heading = `<h2 id="board-summary">${escapeHtml(copy.heading)}</h2>`;

  if (!summary.totalRuns) {
    return `    <section class="board-summary page-section blog-shell" aria-labelledby="board-summary">
      ${heading}
      <p class="board-summary__empty">${escapeHtml(copy.empty)}</p>
    </section>`;
  }

  const languages = Object.entries(summary.locales)
    .sort((first, second) => second[1] - first[1])
    .map(([locale, count]) => `${LANGUAGE_NAMES[lang][locale] ?? locale} (${count})`)
    .join(', ');

  const meta = [
    copy.runs(summary.totalRuns),
    `${copy.languages}: ${languages}`,
    copy.updated(formatDate(summary.generatedAt, lang)),
  ]
    .map((entry) => `<span>${escapeHtml(entry)}</span>`)
    .join('');

  const index =
    summary.index === null
      ? ''
      : `<div class="board-summary__index"><p class="board-summary__index-label">${escapeHtml(
          copy.indexLabel
        )}</p><p class="board-summary__index-value">${escapeHtml(percentText(summary.index, lang))} <small>${escapeHtml(
          BAND_LABELS[lang][summary.band] ?? ''
        )}</small></p><p class="board-summary__index-note">${escapeHtml(copy.indexNote)}</p></div>`;

  return `    <section class="board-summary page-section blog-shell" aria-labelledby="board-summary">
      ${heading}
      <p class="board-summary__meta">${meta}</p>
      ${summary.confident ? '' : `<p class="board-summary__caveat">${escapeHtml(copy.thin)}</p>`}
      ${index}
      <div class="board-cards">${summary.boards.map((board) => renderBoard(board, copy, lang)).join('')}</div>
      <p class="board-summary__note">${escapeHtml(copy.bandNote)}</p>
    </section>`;
};
