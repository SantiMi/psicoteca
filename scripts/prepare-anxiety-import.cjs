const fs = require('node:fs');
const path = require('node:path');
const {loadContent} = require('./content-loader.cjs');
const {library, norm} = loadContent('data/catalog.ts');
const {sources, anxietyFamily} = loadContent('data/organization.ts');
const batch = 'anxiety-organization-2026-10-23-v1';
const provenance = {visibility: 'draft', reviewStatus: 'pending', importBatch: batch};
const documents = [];
for (const source of sources) documents.push({path: `sources/${source.id}`, data: {...source, ...provenance, usageStatus: 'reference-only', importedFullText: false}});
documents.push({path: 'families/ansiedad', data: {...anxietyFamily, ...provenance, editorialScope: 'partial-pilot'}});
documents.push({path: 'classificationEntries/dsm-5-tr-anxiety-chapter', data: {...provenance, sourceId: 'dsm-5-tr', system: 'DSM-5-TR', title: 'Trastornos de ansiedad', sourceSection: 'Sección II', printedPage: 215, locatorType: 'chapter', familyId: 'ansiedad', labelStatus: 'source-heading', codeStatus: 'not-assigned'}});
documents.push({path: 'classificationEntries/cie-11-guide-chapter-06', data: {...provenance, sourceId: 'cie-11-guia-2024', system: 'CIE-11', title: 'Estructura del capítulo 06', sourceSection: '3.2.6', printedPage: 328, pdfPage: 328, locatorType: 'guide-section', familyId: 'ansiedad', labelStatus: 'abbreviated-editorial-label', codeStatus: 'not-assigned', diagnosticContentStatus: 'pending-clinical-source'}});
for (const topic of anxietyFamily.topics) {
  const item = library.find(x => x.id === topic.id);
  if (!item || item.category !== 'psicopatologias') throw new Error(`Missing pilot topic: ${topic.id}`);
  const words = [item.title, ...item.synonyms].map(norm);
  const prefixes = [...new Set(words.flatMap(word => Array.from({length: Math.min(word.length, 48)}, (_, i) => word.slice(0, i + 1))))];
  documents.push({path: `catalog/${item.id}`, data: {...provenance, id: item.id, title: item.title, category: item.category, family: 'Trastornos de ansiedad', familyId: 'ansiedad', summary: item.summary, sortKey: norm(item.title) + '#' + item.id, prefixes}});
  documents.push({path: `concepts/${item.id}`, data: {...provenance, title: item.title, status: 'borrador', essentials: item.essentials, deep: item.deep, references: item.references.map(r => ({label: r.label, ...(r.url ? {url: r.url} : {})})), contentOrigin: {repository: 'SantiMi/psicoteca', baseCommit: 'cd19e1d06138473036df65a005e286e85afd354a', kind: 'existing-educational-summary'}, classificationReview: {dsm: 'pending-source-review', cie11: 'pending-clinical-source', comparison: 'not-established'}}});
}
const manifest = {projectId: 'psicoteca-9f417', databaseId: '(default)', batch, documents};
if (documents.length !== 13 || new Set(documents.map(d => d.path)).size !== documents.length || documents.some(d => d.data.visibility !== 'draft')) throw new Error('Invalid import manifest');
const destination = path.resolve(__dirname, '../tmp/anxiety-import.json');
fs.mkdirSync(path.dirname(destination), {recursive: true});
fs.writeFileSync(destination, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${documents.length} create-only draft documents for ${manifest.projectId}. No remote writes performed.`);
