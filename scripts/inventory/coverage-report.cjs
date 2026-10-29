const {validateInventory,readInventory,kinds,contentStates}=require('./validate-inventory.cjs');
const countBy=(entries,field,values)=>Object.fromEntries(values.map(value=>[value,entries.filter(entry=>entry[field]===value).length]));
function buildCoverageReport(inventory,{topicIds}={}){
 const validation=validateInventory(inventory);
 if(!validation.valid)return {schemaVersion:1,valid:false,validation,sources:[],discrepancies:[]};
 const knownTopics=topicIds?new Set(topicIds):null,discrepancies=[];
 const sources=inventory.sources.map(source=>{
  const entries=inventory.entries.filter(entry=>entry.sourceId===source.id),byKind=countBy(entries,'kind',kinds);
  if(source.extractionStatus!=='complete')discrepancies.push({sourceId:source.id,kind:'partial-extraction',count:null});
  if(!source.coverageCheck)discrepancies.push({sourceId:source.id,kind:'unverified-completeness',count:null});
  else{
   if(source.coverageCheck.expectedEntries!==entries.length)discrepancies.push({sourceId:source.id,kind:'entry-count-mismatch',count:source.coverageCheck.expectedEntries-entries.length});
   if(source.coverageCheck.unresolvedItems)discrepancies.push({sourceId:source.id,kind:'unresolved-source-items',count:source.coverageCheck.unresolvedItems});
  }
  if(byKind.unclassified)discrepancies.push({sourceId:source.id,kind:'unclassified-entries',count:byKind.unclassified});
  const missingTopicReferences=knownTopics?entries.filter(entry=>entry.topicId&&!knownTopics.has(entry.topicId)).map(entry=>({entryId:entry.id,topicId:entry.topicId})):[];
  if(missingTopicReferences.length)discrepancies.push({sourceId:source.id,kind:'unknown-topic-links',count:missingTopicReferences.length});
  return {sourceId:source.id,system:source.system,version:source.version,scope:source.scope,extractionStatus:source.extractionStatus,totalEntries:entries.length,
   expectedEntries:source.coverageCheck?.expectedEntries??null,unresolvedItems:source.coverageCheck?.unresolvedItems??null,byKind,
   byReview:countBy(entries,'reviewStatus',['pending','verified']),byContent:countBy(entries,'contentStatus',contentStates),byScope:countBy(entries,'scope',['core','related']),
   entriesWithTopic:entries.filter(entry=>entry.topicId).length,distinctTopicLinks:new Set(entries.map(entry=>entry.topicId).filter(Boolean)).size,missingTopicReferences};
 });
 return {schemaVersion:1,valid:true,validation,totalEntries:inventory.entries.length,distinctTopicLinks:new Set(inventory.entries.map(entry=>entry.topicId).filter(Boolean)).size,
  interpretation:'Classification entries are not a count of mental disorders. Extraction, source verification and clinical content/publication are independent.',sources,discrepancies};
}
function renderCoverageReport(report){
 if(!report.valid)return ['Inventario no válido.',...report.validation.errors.map(error=>`- ${error.path}: ${error.message}`)].join('\n')+'\n';
 const lines=['# Cobertura del inventario de Psicoteca','',`Entradas registradas: ${report.totalEntries}. Temas distintos vinculados: ${report.distinctTopicLinks}.`,
  'Las entradas no equivalen a trastornos: se cuentan por separado agrupaciones, categorías, subtipos y otras condiciones. Extracción completa no equivale a revisión clínica ni publicación.','',
  '| Fuente | Extracción | Entradas | Diagnósticos candidatos | Categorías codificadas | Grupos | Sin clasificar | Verificadas | Contenido ausente / borrador / revisado / publicado |',
  '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'];
 for(const source of report.sources)lines.push(`| ${source.sourceId} | ${source.extractionStatus} | ${source.totalEntries} | ${source.byKind.diagnosis} | ${source.byKind['coded-category']} | ${source.byKind.group} | ${source.byKind.unclassified} | ${source.byReview.verified} | ${contentStates.map(state=>source.byContent[state]).join(' / ')} |`);
 lines.push('','## Desglose por fuente');
 for(const source of report.sources)lines.push('',`### ${source.sourceId}`,`Versión: ${source.version}. Ámbito: ${source.scope}.`,
  `Núcleo: ${source.byScope.core}; relacionadas: ${source.byScope.related}. Total esperado: ${source.expectedEntries??'no comprobado'}. Pendientes de extracción: ${source.unresolvedItems??'no comprobados'}.`,
  `Tipos: ${Object.entries(source.byKind).map(([key,value])=>`${key}: ${value}`).join('; ')}.`,
  `Vínculos: ${source.entriesWithTopic} entradas → ${source.distinctTopicLinks} temas distintos.`);
 lines.push('','## Discrepancias de cobertura');
 if(!report.discrepancies.length)lines.push('Sin discrepancias estructurales detectadas; no constituye validación clínica.');
 for(const item of report.discrepancies)lines.push(`- ${item.sourceId}: ${item.kind}${item.count===null?'':` (${item.count})`}.`);
 return lines.join('\n')+'\n';
}
if(require.main===module){
 if(!process.argv[2]){process.stderr.write('Usage: node scripts/inventory/coverage-report.cjs inventory.json [--json]\n');process.exitCode=2;}
 else try{const report=buildCoverageReport(readInventory(process.argv[2]));process.stdout.write(process.argv.includes('--json')?JSON.stringify(report,null,2)+'\n':renderCoverageReport(report));process.exitCode=report.valid?0:1;}
 catch(error){process.stderr.write(`Coverage could not be computed: ${error.message}\n`);process.exitCode=2;}
}
module.exports={buildCoverageReport,renderCoverageReport};
