import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateInventory}=require('../scripts/inventory/validate-inventory.cjs');
const {buildCoverageReport,renderCoverageReport}=require('../scripts/inventory/coverage-report.cjs');
const source=(id='dsm')=>({id,system:'DSM-5-TR',version:'aportada',language:'es',localFilename:'manual.pdf',sourceSha256:'a'.repeat(64),scope:'piloto',extractionStatus:'partial',pdfPageCount:100,notes:[]});
const entry=(id,overrides={})=>({id,sourceId:'dsm',sourceEntryId:`page-28-${id}`,title:`Entrada ${id}`,kind:'unclassified',parentId:null,code:null,codeSystem:null,pdfPage:28,printedPage:'xxvii',uri:null,sortOrder:0,scope:'core',reviewStatus:'pending',contentStatus:'missing',topicId:null,notes:[],...overrides});
const inventory=entries=>({schemaVersion:1,sources:[source()],entries});

test('accepts pending extraction without changing any review or content states',()=>{
 const input=inventory([entry('a')]),before=JSON.stringify(input),result=validateInventory(input);
 assert.equal(result.valid,true);assert.ok(result.warnings.length);assert.equal(JSON.stringify(input),before);
 const report=buildCoverageReport(input);assert.equal(report.sources[0].byReview.verified,0);assert.equal(report.sources[0].byContent.published,0);
 assert.ok(report.discrepancies.some(item=>item.kind==='unverified-completeness'));
});
test('rejects duplicate IDs and duplicate source identities',()=>{
 for(const input of [inventory([entry('a'),entry('a')]),inventory([entry('a'),entry('b',{sourceEntryId:'page-28-a'})])])assert.equal(validateInventory(input).valid,false);
});
test('rejects missing parents, cycles and cross-source hierarchy',()=>{
 for(const input of [inventory([entry('a',{parentId:'missing'})]),inventory([entry('a',{parentId:'b'}),entry('b',{parentId:'a'})]),{schemaVersion:1,sources:[source(),source('other')],entries:[entry('a'),entry('b',{sourceId:'other',parentId:'a'})]}])assert.equal(validateInventory(input).valid,false);
});
test('requires valid source locators and preserves DSM code systems',()=>{
 for(const change of [{pdfPage:0},{pdfPage:101},{pdfPage:null,printedPage:null},{code:'F41.1',codeSystem:null},{code:'6B00',codeSystem:'CIE-11'}])assert.equal(validateInventory(inventory([entry('a',change)])).valid,false);
 assert.equal(validateInventory(inventory([entry('a',{code:'F41.1',codeSystem:'CIE-10-MC'})])).valid,true);
});
test('does not permit publication to stand in for verification',()=>{
 for(const change of [{contentStatus:'published',topicId:'tag'},{kind:'diagnosis',reviewStatus:'verified',contentStatus:'reviewed',topicId:null},{reviewStatus:'verified'}])assert.equal(validateInventory(inventory([entry('a',change)])).valid,false);
 assert.equal(validateInventory(inventory([entry('a',{kind:'diagnosis',reviewStatus:'verified',contentStatus:'draft',topicId:'tag'})])).valid,true);
});
test('extraction completeness needs a checked denominator and zero unresolved items',()=>{
 const input=inventory([entry('a')]);input.sources[0].extractionStatus='complete';assert.equal(validateInventory(input).valid,false);
 input.sources[0].coverageCheck={expectedEntries:2,unresolvedItems:0,method:'Independent count'};assert.equal(validateInventory(input).valid,false);
 input.sources[0].coverageCheck.expectedEntries=1;input.sources[0].coverageCheck.unresolvedItems=1;assert.equal(validateInventory(input).valid,false);
 input.sources[0].coverageCheck.unresolvedItems=0;assert.equal(validateInventory(input).valid,true);assert.equal(buildCoverageReport(input).sources[0].byReview.pending,1);
});
test('categories are counted separately from diagnoses and unknown topic links are reported',()=>{
 const input={schemaVersion:1,sources:[{...source('icd'),system:'ICD-11'}],entries:[entry('group',{sourceId:'icd',kind:'group'}),entry('category',{sourceId:'icd',kind:'coded-category',code:'6B00',codeSystem:'ICD-11-MMS',parentId:'group',topicId:'tag',contentStatus:'draft'}),entry('related',{sourceId:'icd',kind:'specifier',scope:'related',parentId:'category'})]};
 const report=buildCoverageReport(input,{topicIds:['another-topic']});assert.equal(report.valid,true);assert.equal(report.sources[0].byKind.diagnosis,0);assert.equal(report.sources[0].byKind['coded-category'],1);assert.equal(report.sources[0].byScope.related,1);assert.equal(report.sources[0].missingTopicReferences.length,1);assert.match(renderCoverageReport(report),/no equivalen a trastornos/);
});
