"use client";
import {useEffect, useRef, useState, type FormEvent} from "react";
import Link from "next/link";
import {ArrowRight, Search, X} from "lucide-react";
import type {LookupResult} from "@/types/lookup";

const examples = ["Qué es el TAG", "Pánico y ansiedad generalizada", "Efectos de sertralina"];
export function LibrarySearch() {
 const [query,setQuery] = useState("");
 const [result,setResult] = useState<LookupResult | null>(null);
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState("");
 const activeRequest = useRef<AbortController | null>(null);
 useEffect(() => () => activeRequest.current?.abort(),[]);
 function edit(value: string) {activeRequest.current?.abort();setQuery(value);setResult(null);setError("");setLoading(false);}
 async function search(value: string) {
  const text=value.trim(); if(text.length<2)return;
  activeRequest.current?.abort();const controller=new AbortController();activeRequest.current=controller;
  setQuery(value);setLoading(true);setError("");setResult(null);
  try {const response=await fetch(`/api/lookup?q=${encodeURIComponent(text)}`,{signal:controller.signal});if(!response.ok)throw new Error("lookup failed");const data=await response.json() as LookupResult;if(!controller.signal.aborted)setResult(data);}
  catch {if(!controller.signal.aborted)setError("No pudimos cargar la explicación. Probá nuevamente.");}
  finally {if(!controller.signal.aborted)setLoading(false);}
 }
 function submit(event: FormEvent) {event.preventDefault();void search(query);}
 return <div className="mt-8">
  <form onSubmit={submit} role="search" aria-label="Consultar Psicoteca" className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-blue-50">
   <Search aria-hidden="true" size={21} className="ml-3 shrink-0 text-slate-400"/>
   <input type="search" aria-label="Qué querés entender" placeholder="¿Qué querés entender?" value={query} maxLength={180} onChange={event=>edit(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base text-deep outline-none sm:text-lg"/>
   {query && <button type="button" aria-label="Limpiar búsqueda" onClick={()=>edit("")} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><X size={17}/></button>}
   <button type="submit" disabled={query.trim().length<2 || loading} className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-45">{loading ? "Buscando…" : "Buscar"}</button>
  </form>
  {!result && !loading && !error && <div className="mt-5 text-sm text-slate-500"><p>Por ejemplo:</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{examples.map(example=><button type="button" key={example} onClick={()=>void search(example)} className="text-left text-brand underline decoration-blue-200 underline-offset-4">{example}</button>)}</div></div>}
  {loading && <p role="status" className="mt-8 text-sm text-slate-500">Consultando la biblioteca…</p>}
  {error && <p role="alert" className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
  {result && <div className="mt-9" aria-live="polite">
   {result.kind === "answer" && result.answer && <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
    <h2 className="text-2xl font-bold text-deep">{result.heading}</h2><p className="mt-4 text-lg leading-8 text-slate-700">{result.answer.summary}</p>
    <ul className="mt-5 list-disc space-y-2 pl-5 leading-7 text-slate-600">{result.answer.points.map(point=><li key={point}>{point}</li>)}</ul>
    <Link href={result.answer.href} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">Entender un poco más <ArrowRight aria-hidden="true" size={16}/></Link>
    {result.answer.links.length>0 && <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm">{result.answer.links.map(link=><Link key={link.href} href={link.href} className="text-brand underline underline-offset-4">{link.label}</Link>)}</div>}
    {result.answer.sources.length>0 && <details className="mt-5 text-xs text-slate-500"><summary className="cursor-pointer">Fuentes de esta explicación</summary><ul className="mt-3 space-y-2">{result.answer.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">{source.label} ↗</a></li>)}</ul></details>}
   </article>}
   {result.kind === "comparison" && result.comparison && <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Una diferencia, en pocas palabras</p><h2 className="mt-2 text-2xl font-bold text-deep">{result.heading}</h2>{result.comparison.shared.map(text=><p key={text} className="mt-4 leading-7 text-slate-600">{text}</p>)}<div className="mt-5 grid gap-5 sm:grid-cols-2">{result.comparison.columns.map(column=><section key={column.title} className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-deep">{column.title}</h3><ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">{column.points.map(point=><li key={point}>{point}</li>)}</ul></section>)}</div>{!result.comparison.documented && <p className="mt-4 text-sm text-slate-500">Mostramos las características disponibles de cada tema. Todavía no tenemos un diferencial documentado para este par.</p>}<Link href={result.comparison.href} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">Ver la comparación completa <ArrowRight size={16} aria-hidden="true"/></Link>{result.comparison.sources.length>0 && <details className="mt-5 text-xs text-slate-500"><summary className="cursor-pointer">Fuentes de esta comparación</summary><ul className="mt-3 space-y-2">{result.comparison.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">{source.label} ↗</a></li>)}</ul></details>}</article>}
   {result.kind === "choices" && <><h2 className="text-xl font-bold text-deep">{result.heading}</h2><div className="mt-4 divide-y divide-slate-200">{result.items.map(item=><Link key={item.id} href={item.href} className="block py-4"><h3 className="font-semibold text-brand">{item.title} →</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p></Link>)}</div></>}
   {result.kind === "empty" && <div className="rounded-xl bg-slate-50 p-6"><h2 className="font-semibold text-deep">{result.heading}</h2><p className="mt-3 text-sm leading-7 text-slate-600">La biblioteca todavía es pequeña. Probá el nombre de un trastorno o medicamento; si buscás una diferencia, escribí ambos nombres.</p></div>}
  </div>}
 </div>;
}
