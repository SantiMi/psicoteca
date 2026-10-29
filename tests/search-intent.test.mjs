import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {loadContent}=createRequire(import.meta.url)('../scripts/content-loader.cjs');
const {resolveSearchIntent}=loadContent('data/search-intent.ts');
const {library}=loadContent('data/catalog.ts');
const search=q=>resolveSearchIntent(q,library);

test('understands a definition, medication question and medication side effects without full-string catalog matching',()=>{
 assert.deepEqual(search('¿Qué es el TAG?'),{kind:'definition',ids:['tag']});
 assert.deepEqual(search('qué medicación se usa para el TAG'),{kind:'medication',ids:['tag']});
 assert.deepEqual(search('efectos adversos de sertralina'),{kind:'definition',ids:['sertralina']});
});
test('recognizes pairs by name and keeps drugs separate from diagnoses',()=>{
 assert.deepEqual(search('diferencias entre pánico y ansiedad generalizada'),{kind:'comparison',ids:['trastorno-de-panico','tag']});
 assert.deepEqual(search('sertralina vs escitalopram'),{kind:'comparison',ids:['sertralina','escitalopram']});
 assert.equal(search('sertralina y depresión').kind,'choices');
});
test('does not turn broad anxiety or missing content into a single diagnosis',()=>{
 assert.equal(search('ansiedad').kind,'choices');
 assert.ok(search('ansiedad').ids.length>1);
 assert.equal(search('pánico o ansiedad').kind,'choices');
 assert.deepEqual(search('trastorno inexistente xyzabc'),{kind:'empty',ids:[]});
 assert.equal(search('   ').kind,'empty');
});
