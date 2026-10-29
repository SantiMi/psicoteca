#!/usr/bin/env node
'use strict';
// Local preparation only. This command has no database or network client.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

function assemble(inputs) {
  const sources = []; const entries = []; const runs = []; const seenSources = new Set(); const seenEntries = new Set();
  for (const input of inputs) {
    if (input.schemaVersion !== 1 || !Array.isArray(input.sources) || !Array.isArray(input.entries)) throw new Error('Invalid inventory envelope');
    for (const source of input.sources) {
      if (seenSources.has(source.id)) throw new Error(`Duplicate source: ${source.id}`);
      seenSources.add(source.id); sources.push(source);
    }
    for (const entry of input.entries) {
      if (seenEntries.has(entry.id)) throw new Error(`Duplicate entry: ${entry.id}`);
      seenEntries.add(entry.id); entries.push(entry);
    }
    if (Array.isArray(input.runs)) runs.push(...input.runs);
  }
  return {schemaVersion:1, generatedAt:new Date().toISOString(), sources, entries, runs};
}

function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
function asCsv(inventory) {
  const sourceById = new Map(inventory.sources.map(source=>[source.id,source]));
  const fields = ['id','fuente','version','nombre','tipo','codigo','codigoOCRPorComprobar','sistemaCodigo','ambito','paginaPDF','paginaIndice','paginaDestino','revision','contenido','ficha','URI','observaciones'];
  const rows = inventory.entries.map(entry=>{
    const source=sourceById.get(entry.sourceId);
    return [entry.id,source?.system,source?.version,entry.title,entry.kind,entry.code,entry.code===null ? entry.rawCode : null,entry.codeSystem,entry.scope,entry.pdfPage,entry.printedPage,entry.destinationPrintedPage,entry.reviewStatus,entry.contentStatus,entry.topicId,entry.uri,(entry.notes ?? []).join(' | ')];
  });
  return '\ufeff' + [fields,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

if (require.main === module) {
  const args = process.argv.slice(2); const outputIndex = args.indexOf('--output');
  if (outputIndex < 0 || !args[outputIndex+1]) {console.error('Usage: node scripts/inventory/assemble-inventory.cjs source1.json source2.json --output tmp/inventory/combined.json');process.exit(1);}
  const output=path.resolve(args[outputIndex+1]); const inputPaths=args.slice(0,outputIndex);
  if (!inputPaths.length) {console.error('At least one source inventory is required');process.exit(1);}
  let temporary;
  try {
    const inventory=assemble(inputPaths.map(filename=>JSON.parse(fs.readFileSync(filename,'utf8').replace(/^\ufeff/,''))));
    fs.mkdirSync(path.dirname(output),{recursive:true});
    temporary=output + '.' + crypto.randomUUID() + '.tmp';
    fs.writeFileSync(temporary,JSON.stringify(inventory,null,2)+'\n','utf8');
    execFileSync(process.execPath,[path.join(__dirname,'validate-inventory.cjs'),temporary],{stdio:'pipe'});
    fs.renameSync(temporary,output); temporary=undefined;
    const csv=output.replace(/\.json$/i,'')+'.csv';fs.writeFileSync(csv,asCsv(inventory),'utf8');
    console.log(JSON.stringify({sources:inventory.sources.length,entries:inventory.entries.length,output,csv}));
  } catch(error) {
    if (temporary && fs.existsSync(temporary))fs.unlinkSync(temporary);
    console.error(error.message);if(error.stdout)console.error(error.stdout.toString());if(error.stderr)console.error(error.stderr.toString());process.exit(1);
  }
}
module.exports={assemble,asCsv};
