import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {assemble,asCsv}=createRequire(import.meta.url)('../scripts/inventory/assemble-inventory.cjs');

test('combining source inventories preserves transcription provenance and rejects collisions',()=>{
 const run={id:'scan-1',sourceId:'dsm',transcriptionCorrections:[{before:'F41.O',after:'F41.0'}]};
 const first={schemaVersion:1,sources:[{id:'dsm'}],entries:[{id:'row-1'}],runs:[run]};
 const second={schemaVersion:1,sources:[{id:'cie'}],entries:[{id:'row-2'}]};
 const result=assemble([first,second]);
 assert.deepEqual(result.runs,[run]);
 assert.equal(result.entries.length,2);
 assert.throws(()=>assemble([first,first]),/Duplicate source/);
 assert.throws(()=>assemble([first,{...second,entries:[{id:'row-1'}]}]),/Duplicate entry/);
});
test('review CSV retains uncertain raw codes as observations without making spreadsheet formulas executable',()=>{
 const csv=asCsv({sources:[{id:'dsm',system:'DSM-5-TR',version:'supplied'}],entries:[{id:'x',sourceId:'dsm',title:'=not-a-formula',code:null,rawCode:'F41.O',notes:['check "scan"']} ]});
 assert.ok(csv.includes('codigoOCRPorComprobar'));
 assert.ok(csv.includes('"F41.O"'));
 assert.ok(csv.includes('"\'=not-a-formula"'));
 assert.ok(csv.includes('check ""scan""'));
});
