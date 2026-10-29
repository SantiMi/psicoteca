import {readFile} from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import {notFound} from "next/navigation";
import {InventoryReview, type ReviewEntry, type ReviewSource} from "@/components/inventory-review";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {title:"Inventario de contenido · Revisión local",robots:{index:false,follow:false}};

type LocalSource = Partial<ReviewSource> & {id:string;system?:string;url?:string};
type LocalEntry = ReviewEntry & {destinationPrintedPage?:string|number|null;notes?:unknown[]};
type LocalInventory = {schemaVersion:number;sources:LocalSource[];entries:LocalEntry[]};
function officialLink(value: unknown): string | null {
  if(typeof value!=="string")return null;
  try {const url=new URL(value);return ["https:","http:"].includes(url.protocol) ? url.href : null;} catch {return null;}
}

export default async function CoveragePage() {
  // This view is opt-in for the localhost editorial process. Production defaults to 404.
  if(process.env.PSICOTECA_INVENTORY_REVIEW!=="true")notFound();
  let inventory: LocalInventory | null = null;
  try {
    const data=JSON.parse(await readFile(path.join(process.cwd(),"tmp","inventory","combined.json"),"utf8")) as LocalInventory;
    if(data.schemaVersion===1 && Array.isArray(data.sources) && Array.isArray(data.entries))inventory=data;
  } catch { /* The local artifact may not have been prepared yet. Do not expose filesystem errors. */ }
  const sources: ReviewSource[]=(inventory?.sources ?? []).map(source=>({
    id:source.id,title:source.title ?? source.system ?? source.id,version:source.version ?? "Por comprobar",scope:source.scope ?? "Alcance pendiente de documentar",extractionStatus:source.extractionStatus==="complete" ? "complete" : "partial",sourceUrl:officialLink(source.sourceUrl ?? source.url),attribution:typeof source.attribution==="string" ? source.attribution : null,
  }));
  const entries: ReviewEntry[]=(inventory?.entries ?? []).map(entry=>({
    id:entry.id,sourceId:entry.sourceId,title:entry.title,kind:entry.kind,code:entry.code,codeSystem:entry.codeSystem,scope:entry.scope,reviewStatus:entry.reviewStatus,contentStatus:entry.contentStatus,topicId:entry.topicId,pdfPage:entry.pdfPage,printedPage:entry.printedPage,destinationPrintedPage:entry.destinationPrintedPage==null ? null : String(entry.destinationPrintedPage),uri:officialLink(entry.uri),hasNotes:Array.isArray(entry.notes) && entry.notes.length>0,
  }));
  return <main className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-8">
    <Link href="/" className="text-sm text-slate-500 hover:text-brand">← Volver al buscador</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-brand">Revisión local</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-deep sm:text-4xl">Inventario de contenido</h1>
    <p className="mt-4 max-w-3xl leading-8 text-slate-600">Este registro permite saber qué entradas encontramos en cada fuente y cuáles todavía necesitan una explicación y revisión. Inventariar una entrada no la publica en el buscador ni establece una equivalencia entre los manuales.</p>
    {inventory ? <InventoryReview sources={sources} entries={entries}/> : <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-deep">El inventario local todavía no está preparado</h2><p className="mt-3 text-sm leading-7 text-slate-600">Prepará y validá el archivo de inventario combinado con las herramientas de importación. Esta vista estará disponible cuando termine esa comprobación.</p></div>}
  </main>;
}
