"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowLeftRight,BookOpen,AlertTriangle,Brain,Pill} from "lucide-react";
import {disorders,medicines,type Entry} from "@/data/comparisons";
type Kind="trastornos"|"farmacos";
export default function ComparePage(){
 const [kind,setKind]=useState<Kind>("trastornos");
 const [a,setA]=useState("panico");const [b,setB]=useState("tag");
 const items=kind==="trastornos"?disorders:medicines;
 const first=items.find(x=>x.id===a)??items[0]!;
 const second=items.find(x=>x.id===b)??items[1]!;
 const change=(next:Kind)=>{setKind(next);const list=next==="trastornos"?disorders:medicines;setA(list[0]!.id);setB(list[1]!.id);};
 const field=(title:string,render:(v:Entry)=>React.ReactNode)=> <div className="grid grid-cols-1 gap-3 border-t border-slate-100 py-5 md:grid-cols-[170px_1fr_1fr] md:gap-5"><h3 className="font-bold text-deep">{title}</h3><div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{render(first)}</div><div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{render(second)}</div></div>;
 const sources=(v:Entry)=><ul className="space-y-2">{v.sources.map(x=><li key={x.url+x.label}><a className="font-semibold text-brand underline underline-offset-2" target="_blank" rel="noopener noreferrer" href={x.url}>{x.label}</a></li>)}</ul>;
 return <main className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><ArrowLeft size={16}/> Volver a la biblioteca</Link>
 <div className="mt-7 flex flex-wrap items-start gap-3"><div className="rounded-2xl bg-blue-100 p-3 text-brand"><ArrowLeftRight size={26}/></div><div><p className="text-sm font-bold uppercase tracking-wide text-brand">Herramientas de consulta</p><h1 className="mt-1 text-3xl font-extrabold text-deep sm:text-4xl">Comparar conceptos</h1><p className="mt-3 max-w-2xl text-slate-600">Seleccioná dos elementos de una misma familia y consultá sus diferencias de un vistazo. Comparaciones educativas, no guías de decisión clínica.</p></div></div>
 <div className="mt-9 flex flex-wrap gap-3" role="group" aria-label="Tipo de comparación">
 <button aria-pressed={kind==="trastornos"} onClick={()=>change("trastornos")} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${kind==="trastornos"?"bg-brand text-white":"border border-slate-200 bg-white text-deep"}`}><Brain size={18}/> Trastornos</button>
 <button aria-pressed={kind==="farmacos"} onClick={()=>change("farmacos")} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${kind==="farmacos"?"bg-brand text-white":"border border-slate-200 bg-white text-deep"}`}><Pill size={18}/> Psicofármacos</button></div>
 <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><p className="mb-4 text-xs font-bold uppercase tracking-wide text-brand">Familia: {first.family}</p>
 <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]"><label className="block"><span className="mb-2 block text-sm font-semibold text-deep">Primera ficha</span><select value={first.id} onChange={e=>setA(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-deep">{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <button aria-label="Intercambiar elementos" title="Intercambiar elementos" onClick={()=>{setA(second.id);setB(first.id)}} className="mx-auto rounded-xl bg-blue-50 p-3 text-brand"><ArrowLeftRight size={20}/></button>
 <label className="block"><span className="mb-2 block text-sm font-semibold text-deep">Segunda ficha</span><select value={second.id} onChange={e=>setB(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-deep">{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div>
 {first.id===second.id?<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Elegiste el mismo elemento en ambas columnas. Seleccioná otro para contrastarlos.</p>:null}
 </section>
 <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="Tabla comparativa"><div className="mb-5 grid gap-3 md:grid-cols-[170px_1fr_1fr] md:gap-5"><div className="hidden md:block"/>{[first,second].map((x,i)=><div key={i} className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold text-brand">{x.family}</p><h2 className="mt-1 text-xl font-bold text-deep">{x.name}</h2></div>)}</div>
 {field("En una frase",v=>v.oneLine)}
 {field(kind==="trastornos"?"Características clave":"Cómo funciona",v=><ul className="list-disc space-y-1 pl-4">{v.points.map(p=><li key={p}>{p}</li>)}</ul>)}
 {field(kind==="trastornos"?"Abordajes habituales":"¿Dónde se utiliza?",v=>v.uses)}
 {field("Recaudos importantes",v=>v.cautions)}
 {field("Fuentes para profundizar",sources)}
 </section>
 <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><AlertTriangle className="mt-1 shrink-0" size={20}/><p><strong>Contenido de demostración pendiente de revisión editorial.</strong> Las síntesis no reproducen criterios diagnósticos completos ni fichas regulatorias específicas de ANMAT. La evidencia, indicaciones y precauciones deben contrastarse con fuentes vigentes. No usar esta pantalla para diagnosticar, seleccionar, ajustar o suspender tratamientos.</p></aside>
 <div className="mt-8 flex items-center gap-2 text-sm text-slate-500"><BookOpen size={16}/> Próximamente: ampliación de familias y más comparaciones respaldadas por bibliografía.</div>
 </main>
}