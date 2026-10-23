import Link from "next/link";
import type {Differential} from "@/data/differentials";
import {getPathologyProfile} from "@/data/clinical";
import {disorders} from "@/data/comparisons";
const title = (id: string) => disorders.find(d => d.id === id)?.name ?? (id === "depresion" ? "Depresión" : id);
export function DifferentialCard({differential: d, firstId}: {differential: Differential; firstId?: string}) {
  const reverse = firstId === d.b;
  const columns = reverse ? [{id:d.b,points:d.distinguishB},{id:d.a,points:d.distinguishA}] : [{id:d.a,points:d.distinguishA},{id:d.b,points:d.distinguishB}];
  return <article id={d.id} className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
    <p className="text-xs font-bold uppercase tracking-wide text-brand">Diagnóstico diferencial · síntesis editorial</p><h3 className="mt-2 text-xl font-bold text-deep">{title(columns[0].id)} <span className="font-normal text-slate-500">y</span> {title(columns[1].id)}</h3>
    <h4 className="mt-5 font-bold text-deep">Rasgos en común</h4><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7">{d.shared.map(p => <li key={p}>{p}</li>)}</ul>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{columns.map(column => <div key={column.id} className="rounded-xl bg-blue-50 p-4"><h4 className="font-bold text-deep">Qué orienta hacia {title(column.id).toLowerCase()}</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{column.points.map(p => <li key={p}>{p}</li>)}</ul>{getPathologyProfile(column.id) && <Link className="mt-4 inline-block text-sm font-semibold text-brand underline" href={`/ficha/${column.id}`}>Leer la ficha →</Link>}</div>)}</div>
    <h4 className="mt-5 font-bold text-deep">Qué conviene explorar</h4><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7">{d.evaluate.map(p => <li key={p}>{p}</li>)}</ul>
    <p className="mt-4 text-xs leading-6 text-slate-500">Comparación educativa pendiente de revisión especializada; no es una lista completa de criterios ni una prueba diagnóstica.</p>
    <ul className="mt-4 space-y-2 text-xs">{d.sources.map(source => <li key={source.url}><a className="font-semibold text-brand underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><span className="text-slate-500"> · {source.scope}</span></li>)}</ul>
  </article>;
}
