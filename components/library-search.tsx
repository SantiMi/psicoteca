"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Search,ArrowUpRight,Brain,Pill,BookOpen,ClipboardList,LibraryBig} from "lucide-react";
import {libraryCategories,type CategoryId} from "@/data/category-config";
type Row={id:string;title:string;category:CategoryId;family:string;summary:string};
type Result={items:Row[];nextCursor:string|null;mode:string};
const icons={psicopatologias:Brain,psicofarmacologia:Pill,teoria:BookOpen,evaluaciones:ClipboardList,clasificaciones:LibraryBig};
export function LibrarySearch({initialCategory}:{initialCategory?:CategoryId}){
 const [query,setQuery]=useState("");const [category,setCategory]=useState<CategoryId|undefined>(initialCategory);
 const [items,setItems]=useState<Row[]>([]);const [cursor,setCursor]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);const [moreLoading,setMoreLoading]=useState(false);const [error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError("");
 const timer=setTimeout(async()=>{try{const p=new URLSearchParams();if(query.trim())p.set("q",query.trim());if(category)p.set("category",category);
 const response=await fetch("/api/catalog?"+p.toString(),{signal:controller.signal});if(!response.ok)throw new Error("search unavailable");const data=await response.json() as Result;
 setItems(data.items);setCursor(data.nextCursor);}catch(e){if(!controller.signal.aborted){setError("No se pudo cargar el catálogo. Intentá nuevamente.");setItems([]);setCursor(null);}}finally{if(!controller.signal.aborted)setLoading(false);}},query?280:0);
 return()=>{clearTimeout(timer);controller.abort()};},[query,category]);
 async function more(){if(!cursor)return;setMoreLoading(true);try{const p=new URLSearchParams({cursor});if(query.trim())p.set("q",query.trim());if(category)p.set("category",category);const response=await fetch("/api/catalog?"+p.toString());if(!response.ok)throw new Error("unavailable");const data=await response.json() as Result;setItems(old=>[...old,...data.items.filter(x=>!old.some(y=>y.id===x.id))]);setCursor(data.nextCursor);}catch{setError("No se pudieron cargar más resultados.")}finally{setMoreLoading(false)}}
 return <><div className="relative mx-auto mt-9 max-w-3xl"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand" size={23}/><input aria-label="Buscar en Psicoteca" autoFocus placeholder="¿Qué necesitás consultar?" type="search" value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white py-5 pl-14 pr-5 text-lg text-deep shadow-sm outline-none focus:border-brand focus:ring-4 focus:ring-blue-100"/></div>
 <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">{libraryCategories.map(item=>{const Icon=icons[item.id];return <button type="button" key={item.id} onClick={()=>setCategory(v=>v===item.id?undefined:item.id)} aria-pressed={category===item.id} className={`rounded-2xl border p-4 text-left transition hover:border-brand ${category===item.id?"border-brand ring-2 ring-blue-100":"border-slate-200"} ${item.color}`}><Icon className="text-brand" size={25}/><strong className="mt-3 block text-sm text-deep">{item.title}</strong><span className="mt-1 block text-xs text-slate-600">{item.subtitle}</span></button>})}</div>
 <div className="mt-10 flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-deep">{category?libraryCategories.find(x=>x.id===category)?.title:"Biblioteca"}</h2><p className="mt-1 text-sm text-slate-500">Resultados por página · Catálogo en ampliación</p></div>{category&&<button className="text-sm font-semibold text-brand" onClick={()=>setCategory(undefined)}>Ver todas</button>}</div>
 {loading?<p role="status" className="mt-6 text-sm text-slate-500">Buscando conceptos…</p>:error?<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>:null}
 <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map(item=><Link key={item.id} href={`/ficha/${item.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand hover:shadow-sm"><span className="text-xs font-semibold uppercase tracking-wide text-brand">{libraryCategories.find(c=>c.id===item.category)?.title} · {item.family}</span><div className="mt-2 flex items-start justify-between gap-2"><h3 className="font-bold text-deep">{item.title}</h3><ArrowUpRight className="shrink-0 text-brand" size={18}/></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.summary}</p></Link>)}</div>
 {!loading&&!error&&!items.length&&<p className="mt-5 rounded-2xl bg-white p-7 text-slate-600">No encontramos resultados. Probá otro término o quitá el filtro.</p>}
 {cursor&&!loading&&<button onClick={more} disabled={moreLoading} className="mt-6 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-brand disabled:opacity-50">{moreLoading?"Cargando…":"Ver más resultados"}</button>}
 </>;
}