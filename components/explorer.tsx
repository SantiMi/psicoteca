"use client";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { searchConcepts } from "@/lib/content";
import { CategoryIcon } from "@/components/category-icon";
import { ConceptCard } from "@/components/concept-card";
import type { CategorySlug } from "@/types/content";
export function Explorer({ initialCategory }: { initialCategory?: CategorySlug }) {
 const [query, setQuery] = useState("");
 const [category, setCategory] = useState<CategorySlug | undefined>(initialCategory);
 const results = useMemo(() => searchConcepts(query, category), [query, category]);
 const active = Boolean(query.trim() || category);
 return <>
 <div className="relative mx-auto mt-8 max-w-2xl"><Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22}/>
 <input aria-label="Buscar conceptos" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="¿Qué necesitás consultar?" className="w-full rounded-2xl border border-slate-200 bg-white py-5 pl-14 pr-5 text-base text-deep shadow-soft outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-blue-100" /></div>
 <section className="mt-14" aria-labelledby="categories-title"><div className="mb-6 flex items-center justify-between gap-3"><h2 id="categories-title" className="text-2xl font-bold text-deep">Explorar categorías</h2>{category && <button type="button" onClick={() => setCategory(undefined)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"><X size={15}/> Quitar filtro</button>}</div>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map(item => <button type="button" aria-pressed={category === item.slug} key={item.slug} onClick={() => setCategory(current => current === item.slug ? undefined : item.slug)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 ${category === item.slug ? "border-brand bg-blue-50 ring-1 ring-brand" : "border-slate-200 bg-white"}`}><CategoryIcon category={item.slug}/><span><span className="block font-semibold text-deep">{item.title}</span><span className="mt-0.5 block text-xs text-slate-500">{item.description}</span></span></button>)}</div>
 </section>
 <section className="mt-14" aria-live="polite"><div className="mb-6 flex flex-wrap items-end justify-between gap-2"><div><p className="mb-1 text-sm font-semibold text-brand">{active ? "Tu búsqueda" : "Para empezar"}</p><h2 className="text-2xl font-bold text-deep">{active ? "Resultados" : "Temas destacados"}</h2></div><span className="text-sm text-slate-500">{results.length} {results.length === 1 ? "concepto" : "conceptos"}</span></div>
 {results.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map(concept => <ConceptCard key={concept.slug} concept={concept}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p className="font-semibold text-deep">No encontramos resultados</p><p className="mt-2 text-sm text-slate-500">Probá con otra palabra, un sinónimo o sin el filtro de categoría.</p><button type="button" onClick={() => { setQuery(""); setCategory(undefined); }} className="mt-5 font-semibold text-brand hover:underline">Ver todos los conceptos</button></div>}
 </section>
 </>;
}
