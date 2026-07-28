import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const languages = ['en', 'es', 'pt'];
const contentDirectory = path.resolve('content/blog');
const outputPath = path.resolve('assets/js/blog-index.js');
const articleIndex = {};

for (const language of languages) {
  const files = await readdir(path.join(contentDirectory, language));
  articleIndex[language] = files
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => `/content/blog/${language}/${file}`);
}

const output = `window.blogArticleIndex = ${JSON.stringify(articleIndex, null, 2)};\n`;
await writeFile(outputPath, output, 'utf8');

console.log(`Generated blog index with ${Object.values(articleIndex).flat().length} localized articles.`);
