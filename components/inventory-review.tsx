"use client";

import {useDeferredValue, useMemo, useState} from "react";
import Link from "next/link";

export type ReviewSource = {
  id: string;
  title: string;
  version: string;
  scope: string;
  extractionStatus: "partial" | "complete";
  sourceUrl: string | null;
  attribution: string | null;
};
export type ReviewEntry = {
  id: string;
  sourceId: string;
  title: string;
  kind: string;
  code: string | null;
  codeSystem: string | null;
  scope: "core" | "related";
  reviewStatus: "pending" | "verified";
  contentStatus: "missing" | "draft" | "reviewed" | "published";
  topicId: string | null;
  pdfPage: number | null;
  printedPage: string | null;
  destinationPrintedPage: string | null;
  uri: string | null;
  hasNotes: boolean;
};

const pageSize = 20;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const kindLabels: Record<string, string> = {
  group: "Agrupación",
  diagnosis: "Diagnóstico candidato",
  subtype: "Subtipo",
  specifier: "Especificador",
  "clinical-condition": "Motivo de atención",
  "research-condition": "En estudio",
  "coded-category": "Categoría codificada",
  unclassified: "Tipo por comprobar",
};
const contentLabels = {missing:"Sin ficha asociada",draft:"Ficha en borrador",reviewed:"Ficha revisada",published:"Ficha publicada"};

export function InventoryReview({sources,entries}: {sources: ReviewSource[]; entries: ReviewEntry[]}) {
  const [query,setQuery] = useState("");
  const [sourceId,setSourceId] = useState("");
  const [scope,setScope] = useState("");
  const [kind,setKind] = useState("");
  const [page,setPage] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const indexedEntries = useMemo(()=>entries.map(entry=>({...entry,searchText:normalize(`${entry.title} ${entry.code ?? ""}`)})),[entries]);
  const sourceById = useMemo(()=>new Map(sources.map(source=>[source.id,source])),[sources]);
  const kinds = useMemo(()=>[...new Set(entries.map(entry=>entry.kind))],[entries]);
  const filtered = useMemo(()=>{
    const terms=normalize(deferredQuery.trim()).split(/\s+/).filter(Boolean);
    return indexedEntries.filter(entry=>(!sourceId || entry.sourceId===sourceId) && (!scope || entry.scope===scope) && (!kind || entry.kind===kind) && terms.every(term=>entry.searchText.includes(term)));
  },[indexedEntries,deferredQuery,sourceId,scope,kind]);
  const lastPage=Math.max(0,Math.ceil(filtered.length/pageSize)-1);
  const currentPage=Math.min(page,lastPage);
  const visible=filtered.slice(currentPage*pageSize,(currentPage+1)*pageSize);
  const totals=useMemo(()=>({
    groups:entries.filter(entry=>entry.kind==="group").length,
    coded:entries.filter(entry=>entry.code!==null).length,
    pending:entries.filter(entry=>entry.reviewStatus==="pending").length,
    linked:new Set(entries.filter(entry=>entry.topicId && entry.contentStatus!=="missing").map(entry=>entry.topicId)).size,
  }),[entries]);

  return <>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[{label:"Entradas inventariadas",value:entries.length},{label:"Agrupaciones",value:totals.groups},{label:"Entradas con código",value:totals.coded},{label:"Fichas distintas asociadas",value:totals.linked}].map(stat=><div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-3xl font-bold text-deep">{stat.value.toLocaleString("es-AR")}</p><p className="mt-2 text-sm text-slate-500">{stat.label}</p></div>)}
    </div>
    <p className="mt-4 text-sm leading-7 text-slate-600">{totals.pending.toLocaleString("es-AR")} entradas pendientes de comprobación editorial. Una categoría, variante o agrupación del inventario no equivale necesariamente a un trastorno distinto ni requiere una ficha independiente.</p>

    <section aria-labelledby="inventory-sources" className="mt-9">
      <h2 id="inventory-sources" className="text-lg font-bold text-deep">Fuentes y alcance de la extracción</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{sources.map(source=>{
        const sourceEntries=entries.filter(entry=>entry.sourceId===source.id);
        const statuses={missing:0,draft:0,reviewed:0,published:0};
        sourceEntries.forEach(entry=>statuses[entry.contentStatus]++);
        return <article key={source.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-deep">{source.title}</h3><p className="mt-1 text-xs text-slate-500">Versión: {source.version}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{source.scope}</p>
          <p className="mt-3 text-sm font-semibold text-deep">{sourceEntries.length.toLocaleString("es-AR")} entradas · {source.extractionStatus==="complete" ? "Extracción completa dentro de este alcance" : "Extracción parcial; conciliación pendiente"}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500">{(Object.keys(statuses) as Array<keyof typeof statuses>).map(status=><div key={status} className="flex justify-between gap-3"><dt>{contentLabels[status]}</dt><dd className="font-semibold text-deep">{statuses[status].toLocaleString("es-AR")}</dd></div>)}</dl>
          {source.sourceUrl && <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-brand underline underline-offset-4">Consultar la fuente oficial ↗</a>}
          {source.attribution && <p className="mt-4 break-words text-xs leading-6 text-slate-500">{source.attribution}</p>}
        </article>;
      })}</div>
    </section>

    <section aria-labelledby="inventory-list" className="mt-10">
      <h2 id="inventory-list" className="text-xl font-bold text-deep">Revisar las entradas</h2>
      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-deep">Nombre o código<input type="search" maxLength={180} value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} placeholder="Ej.: ansiedad, 6B00" className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal outline-brand"/></label>
        <label className="text-sm font-semibold text-deep">Fuente<select value={sourceId} onChange={event=>{setSourceId(event.target.value);setPage(0);}} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal outline-brand"><option value="">Todas las fuentes</option>{sources.map(source=><option key={source.id} value={source.id}>{source.title}</option>)}</select></label>
        <label className="text-sm font-semibold text-deep">Ámbito<select value={scope} onChange={event=>{setScope(event.target.value);setPage(0);}} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal outline-brand"><option value="">Todos los ámbitos</option><option value="core">Núcleo de salud mental</option><option value="related">Áreas relacionadas</option></select></label>
        <label className="text-sm font-semibold text-deep">Tipo de entrada<select value={kind} onChange={event=>{setKind(event.target.value);setPage(0);}} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal outline-brand"><option value="">Todos los tipos</option>{kinds.map(value=><option key={value} value={value}>{kindLabels[value] ?? value}</option>)}</select></label>
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-sm text-slate-500">{filtered.length.toLocaleString("es-AR")} resultados{filtered.length>0 && ` · Mostrando ${currentPage*pageSize+1}–${Math.min((currentPage+1)*pageSize,filtered.length)}`}</p>
      {visible.length===0 ? <p className="mt-5 rounded-xl border border-slate-200 p-6 text-sm text-slate-600">No hay entradas que coincidan con estos filtros.</p> : <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="Entradas del inventario" tabIndex={0}><table className="w-full min-w-[720px] text-left text-sm leading-6"><caption className="sr-only">Entradas de clasificación y estado de su contenido</caption><thead className="bg-slate-50 text-deep"><tr><th scope="col" className="px-5 py-4">Entrada</th><th scope="col" className="px-5 py-4">Referencia</th><th scope="col" className="px-5 py-4">Estado</th></tr></thead><tbody>{visible.map(entry=><tr key={entry.id} className="border-t border-slate-100 align-top">
        <th scope="row" className="max-w-md px-5 py-4 font-normal"><p className="font-semibold text-deep">{entry.title}</p><p className="mt-1 text-xs text-slate-500">{kindLabels[entry.kind] ?? entry.kind} · {entry.scope==="core" ? "Núcleo" : "Área relacionada"}</p><p className="mt-1 text-xs text-slate-400">{sourceById.get(entry.sourceId)?.title}</p>{entry.code && <p className="mt-2 font-mono text-xs text-brand">{entry.code} · {entry.codeSystem}</p>}</th>
        <td className="px-5 py-4 text-xs text-slate-600">{entry.pdfPage!==null && <p>Página PDF {entry.pdfPage}{entry.printedPage ? ` · impresa ${entry.printedPage}` : ""}</p>}{entry.destinationPrintedPage && <p className="mt-1">Remite a la página impresa {entry.destinationPrintedPage}</p>}{entry.uri && <a href={entry.uri} target="_blank" rel="noopener noreferrer" className="inline-block text-brand underline underline-offset-4">Identificador oficial ↗</a>}{entry.pdfPage===null && !entry.uri && <p>Localizador pendiente</p>}</td>
        <td className="px-5 py-4 text-xs"><p className={entry.reviewStatus==="verified" ? "text-emerald-700" : "text-amber-800"}>{entry.reviewStatus==="verified" ? "Referencia comprobada" : "Referencia por comprobar"}</p><p className="mt-1 text-slate-500">{contentLabels[entry.contentStatus]}</p>{entry.hasNotes && <p className="mt-1 text-slate-400">Tiene observaciones editoriales</p>}{entry.topicId && entry.contentStatus!=="missing" && <Link href={`/ficha/${encodeURIComponent(entry.topicId)}`} className="mt-2 inline-block text-brand underline underline-offset-4">{entry.contentStatus==="published" ? "Abrir ficha" : "Abrir ficha de revisión local"} →</Link>}</td>
      </tr>)}</tbody></table></div>}
      <nav aria-label="Páginas del inventario" className="mt-5 flex items-center justify-between gap-4 text-sm"><button type="button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-deep disabled:opacity-40">Anterior</button><span className="text-slate-500">Página {currentPage+1} de {lastPage+1}</span><button type="button" disabled={currentPage>=lastPage} onClick={()=>setPage(currentPage+1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-deep disabled:opacity-40">Siguiente</button></nav>
    </section>
  </>;
}
