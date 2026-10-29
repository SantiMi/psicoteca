const fs=require('node:fs');
const kinds=['group','diagnosis','subtype','specifier','clinical-condition','research-condition','coded-category','unclassified'];
const contentStates=['missing','draft','reviewed','published'];
const object=value=>value!==null && typeof value==='object' && !Array.isArray(value);
const nonempty=value=>typeof value==='string' && value.trim().length>0;
const nullable=value=>value===null || nonempty(value);
const nonnegative=value=>Number.isInteger(value) && value>=0;
function validateInventory(data) {
 const errors=[],warnings=[];
 const fail=(path,message)=>errors.push({path,message});
 const warn=(path,message)=>warnings.push({path,message});
 if(!object(data))return {valid:false,errors:[{path:'$',message:'Expected a JSON object'}],warnings};
 if(data.schemaVersion!==1)fail('schemaVersion','Expected schemaVersion 1');
 if(!Array.isArray(data.sources)||!data.sources.length)fail('sources','Expected sources');
 if(!Array.isArray(data.entries))fail('entries','Expected entries');
 const sources=Array.isArray(data.sources)?data.sources:[],entries=Array.isArray(data.entries)?data.entries:[];
 const sourceMap=new Map(),entryMap=new Map(),identities=new Set();
 sources.forEach((source,index)=>{
  const path=`sources[${index}]`;
  if(!object(source)){fail(path,'Expected source object');return;}
  for(const field of ['id','version','language','scope'])if(!nonempty(source[field]))fail(`${path}.${field}`,'Expected nonempty text');
  if(!['DSM-5-TR','ICD-11'].includes(source.system))fail(`${path}.system`,'Unknown classification system');
  if(!['partial','complete'].includes(source.extractionStatus))fail(`${path}.extractionStatus`,'Expected partial or complete');
  if(!/^[a-f0-9]{64}$/i.test(source.sourceSha256||''))fail(`${path}.sourceSha256`,'Expected source SHA-256');
  if(!source.sourceUrl&&!source.localFilename)fail(path,'Source requires URL or local filename');
  if(source.pdfPageCount!==undefined&&(!Number.isInteger(source.pdfPageCount)||source.pdfPageCount<1))fail(`${path}.pdfPageCount`,'Invalid PDF page count');
  if(!Array.isArray(source.notes)||!source.notes.every(note=>typeof note==='string'))fail(`${path}.notes`,'Expected string notes');
  if(sourceMap.has(source.id))fail(`${path}.id`,'Duplicate source ID');else sourceMap.set(source.id,source);
  if(source.coverageCheck!==undefined&&(!object(source.coverageCheck)||!nonnegative(source.coverageCheck.expectedEntries)||!nonnegative(source.coverageCheck.unresolvedItems)||!nonempty(source.coverageCheck.method)))fail(`${path}.coverageCheck`,'Invalid coverage check');
  if(source.extractionStatus==='complete'&&!source.coverageCheck)fail(`${path}.extractionStatus`,'Complete extraction requires explicit coverageCheck');
  if(source.extractionStatus==='partial')warn(path,'Partial extraction: classification completeness is not established');
 });
 entries.forEach((entry,index)=>{
  const path=`entries[${index}]`;
  if(!object(entry)){fail(path,'Expected entry object');return;}
  for(const field of ['id','sourceId','sourceEntryId','title'])if(!nonempty(entry[field]))fail(`${path}.${field}`,'Expected nonempty text');
  if(entryMap.has(entry.id))fail(`${path}.id`,'Duplicate entry ID');else entryMap.set(entry.id,entry);
  const identity=`${entry.sourceId}\u0000${entry.sourceEntryId}`;
  if(identities.has(identity))fail(`${path}.sourceEntryId`,'Duplicate identity inside source');identities.add(identity);
  const source=sourceMap.get(entry.sourceId);
  if(!source)fail(`${path}.sourceId`,'Unknown source');
  if(!kinds.includes(entry.kind))fail(`${path}.kind`,'Invalid entry kind');
  for(const field of ['parentId','code','codeSystem','printedPage','uri','topicId'])if(!nullable(entry[field]))fail(`${path}.${field}`,'Expected text or null');
  if(entry.pdfPage!==null&&(!Number.isInteger(entry.pdfPage)||entry.pdfPage<1))fail(`${path}.pdfPage`,'Invalid 1-based PDF page');
  if(source?.pdfPageCount&&entry.pdfPage>source.pdfPageCount)fail(`${path}.pdfPage`,'Page outside source');
  if(!entry.pdfPage&&!entry.printedPage&&!entry.uri&&!entry.code)fail(path,'Missing source locator');
  if(!nonnegative(entry.sortOrder))fail(`${path}.sortOrder`,'Invalid sort order');
  if(!['core','related'].includes(entry.scope))fail(`${path}.scope`,'Invalid scope');
  if(!['pending','verified'].includes(entry.reviewStatus))fail(`${path}.reviewStatus`,'Invalid review status');
  if(!contentStates.includes(entry.contentStatus))fail(`${path}.contentStatus`,'Invalid content status');
  if(Boolean(entry.code)!==Boolean(entry.codeSystem))fail(`${path}.codeSystem`,'Code and code system must appear together');
  if(entry.code&&source?.system==='DSM-5-TR'&&entry.codeSystem!=='CIE-10-MC')fail(`${path}.codeSystem`,'DSM codes must remain CIE-10-MC, never inferred as CIE-11');
  if(entry.code&&source?.system==='ICD-11'&&!['CIE-11','ICD-11-MMS','CIE-11-MMS'].includes(entry.codeSystem))fail(`${path}.codeSystem`,'CIE-11 entry has incorrect code system');
  if(entry.contentStatus!=='missing'&&!entry.topicId)fail(`${path}.topicId`,'Content needs explicit topic link');
  if(['reviewed','published'].includes(entry.contentStatus)&&entry.reviewStatus!=='verified')fail(`${path}.contentStatus`,'Unverified entry cannot have reviewed/published content');
  if(entry.reviewStatus==='verified'&&entry.kind==='unclassified')fail(`${path}.kind`,'Unclassified entry cannot be verified');
  if(!Array.isArray(entry.notes)||!entry.notes.every(note=>typeof note==='string'))fail(`${path}.notes`,'Expected string notes');
 });
 entries.forEach((entry,index)=>{
  if(!object(entry)||!entry.parentId)return;
  const parent=entryMap.get(entry.parentId);
  if(!parent)fail(`entries[${index}].parentId`,'Unknown parent');
  else if(parent.sourceId!==entry.sourceId)fail(`entries[${index}].parentId`,'Parent belongs to another source');
 });
 const visited=new Set();
 for(const entry of entryMap.values()){
  if(visited.has(entry.id))continue;
  const chain=new Set();let current=entry;
  while(current&&!visited.has(current.id)){
   if(chain.has(current.id)){fail(`entry:${entry.id}.parentId`,'Cycle in hierarchy');break;}
   chain.add(current.id);current=entryMap.get(current.parentId);
  }
  for(const id of chain)visited.add(id);
 }
 sources.forEach((source,index)=>{
  if(!object(source)||!object(source.coverageCheck))return;
  const count=entries.filter(entry=>entry?.sourceId===source.id).length,check=source.coverageCheck;
  if(source.extractionStatus==='complete'&&(check.expectedEntries!==count||check.unresolvedItems!==0))fail(`sources[${index}].extractionStatus`,'Complete requires expected count and zero unresolved items');
  if(source.extractionStatus!=='complete'&&check.expectedEntries!==count)warn(`sources[${index}].coverageCheck`,`Expected ${check.expectedEntries}; observed ${count}`);
 });
 return {valid:errors.length===0,errors,warnings};
}
function readInventory(filename){return JSON.parse(fs.readFileSync(filename,'utf8').replace(/^\uFEFF/,''));}
if(require.main===module){
 if(!process.argv[2]){process.stderr.write('Usage: node scripts/inventory/validate-inventory.cjs inventory.json\n');process.exitCode=2;}
 else try{const result=validateInventory(readInventory(process.argv[2]));process.stdout.write(JSON.stringify(result,null,2)+'\n');process.exitCode=result.valid?0:1;}
 catch(error){process.stderr.write(`Inventory could not be read: ${error.message}\n`);process.exitCode=2;}
}
module.exports={validateInventory,readInventory,kinds,contentStates};
