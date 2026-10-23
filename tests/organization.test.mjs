import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {loadContent} = require('../scripts/content-loader.cjs');
const {sources, anxietyFamily, getSource} = loadContent('data/organization.ts');

test('each source and section has a unique ID and valid pilot destination', () => {
  assert.equal(new Set(sources.map(s => s.id)).size, sources.length);
  for (const source of sources) {
    assert.equal(new Set(source.sections.map(s => s.id)).size, source.sections.length);
    for (const section of source.sections) if (section.familyId) assert.equal(section.familyId, anxietyFamily.id);
  }
});
test('anxiety has four distinct canonical topics and no automatic code mappings', () => {
  assert.equal(anxietyFamily.topics.length, 4);
  assert.equal(new Set(anxietyFamily.topics.map(t => t.id)).size, 4);
  assert.ok(anxietyFamily.topics.some(t => t.id === 'trastorno-de-panico'));
  assert.ok(!anxietyFamily.topics.some(t => t.id === 'panico'));
  assert.equal(getSource('missing'), undefined);
  assert.ok(getSource('dsm-5-tr').coverageNotice.includes('CIE-10-MC'));
  assert.ok(getSource('cie-11-guia-2024').coverageNotice.includes('no fija una versión'));
});
test('pilot topics exist once in the catalog and legacy panic URLs resolve to the canonical topic', () => {
  const {library, getItem} = loadContent('data/catalog.ts');
  assert.equal(new Set(library.map(item => item.id)).size, library.length);
  for (const topic of anxietyFamily.topics) {
    const matches = library.filter(item => item.id === topic.id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].family, 'Trastornos de ansiedad');
  }
  assert.equal(getItem('panico').id, 'trastorno-de-panico');
  assert.equal(getItem('dsm-5-tr').category, 'clasificaciones');
  assert.equal(getItem('cie-11').category, 'clasificaciones');
});
