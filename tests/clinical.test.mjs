import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {loadContent} = require('../scripts/content-loader.cjs');
const {clinicalSources, pathologyProfiles, drugProfiles, getPathologyProfile} = loadContent('data/clinical.ts');
const {differentials, findDifferential, getDifferentialsFor} = loadContent('data/differentials.ts');
const {resolveComparison, comparisonOptions} = loadContent('data/comparison-options.ts');
const {getItem} = loadContent('data/catalog.ts');

test('all clinical claims have resolvable sources and associated drug cards resolve to catalog items', () => {
  const sourceIds = new Set(clinicalSources.map(s => s.id));
  assert.equal(sourceIds.size, clinicalSources.length);
  const checkSources = ids => {assert.ok(ids.length); for (const id of ids) assert.ok(sourceIds.has(id), id);};
  for (const profile of pathologyProfiles) {
    assert.equal(getItem(profile.id).category, 'psicopatologias');
    checkSources(profile.sourceIds); checkSources(profile.medication.sourceIds);
    assert.ok(profile.deep.length >= 2);
    for (const section of profile.deep) checkSources(section.sourceIds);
    for (const example of profile.medication.examples) {
      assert.equal(getItem(example.drugId).category, 'psicofarmacologia');
      assert.ok(drugProfiles.some(d => d.id === example.drugId));
    }
  }
  assert.equal(getPathologyProfile('fobia-especifica').medication.examples.length, 0);
  for (const drug of drugProfiles) {assert.equal(getItem(drug.id).family,drug.family);checkSources(drug.sourceIds); assert.ok(drug.uses && drug.expected && drug.onset && drug.cautions); assert.ok(drug.adverse.length && drug.recommendations.length);}
});

test('curated differential links resolve both ways without inventing an undocumented pair', () => {
  const pairs = new Set();
  for (const d of differentials) {
    assert.ok(getPathologyProfile(d.a)); assert.ok(getPathologyProfile(d.b)); assert.notEqual(d.a,d.b);
    const key = [d.a,d.b].sort().join(':'); assert.ok(!pairs.has(key)); pairs.add(key);
    assert.equal(findDifferential(d.b,d.a).id,d.id);
    assert.ok(d.sources.length && d.shared.length && d.distinguishA.length && d.distinguishB.length);
  }
  assert.equal(findDifferential('panico','tag').id,'panico-tag');
  assert.equal(findDifferential('depresion','fobia-especifica'),undefined);
  for (const p of pathologyProfiles) assert.ok(getDifferentialsFor(p.id).length);
});

test('comparison deep links preserve drug/pathology selection and reject invalid or duplicate IDs', () => {
  assert.deepEqual(resolveComparison({kind:'farmacos',a:'fluoxetina',b:'paroxetina'}), {kind:'farmacos',a:'fluoxetina',b:'paroxetina'});
  assert.deepEqual(resolveComparison({a:'panico',b:'tag'}), {kind:'trastornos',a:'trastorno-de-panico',b:'tag'});
  for (const query of [{kind:'unknown',a:'missing',b:'missing'},{kind:'farmacos',a:'sertralina',b:'sertralina'},{kind:'trastornos',a:'sertralina',b:'tag'}]) {
    const selection=resolveComparison(query); assert.notEqual(selection.a,selection.b);
    for (const id of [selection.a,selection.b]) assert.ok(comparisonOptions[selection.kind].some(item => item.id===id));
  }
});
