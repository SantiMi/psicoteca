import Link from "next/link";
import {ArrowRight, BookOpen} from "lucide-react";
import {sources} from "@/data/organization";

export const metadata = {title: "Clasificaciones y codificación"};
export default function ClassificationsPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <Link href="/" className="text-sm font-semibold text-brand">← Biblioteca</Link>
    <p className="mt-9 text-xs font-bold uppercase tracking-wider text-brand">Explorar por fuente</p>
    <h1 className="mt-3 text-3xl font-extrabold text-deep sm:text-5xl">Clasificaciones y codificación</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Recorré la estructura de cada fuente y encontrá los temas disponibles en Psicoteca. Cada sistema conserva sus nombres y ubicaciones.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">{sources.map(source => <Link key={source.id} href={`/clasificaciones/${source.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand hover:shadow-sm">
      <BookOpen className="text-brand" aria-hidden="true"/><h2 className="mt-4 text-xl font-bold text-deep">{source.title}</h2>
      <p className="mt-2 text-xs text-slate-500">{source.edition}</p><p className="mt-4 leading-7 text-slate-600">{source.scope}</p>
      <span className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">Recorrer índice <ArrowRight size={16} aria-hidden="true"/></span>
    </Link>)}</div>
    <section className="mt-8 rounded-2xl bg-blue-50 p-6"><h2 className="font-bold text-deep">Explorar por familia clínica</h2><Link href="/familias/ansiedad" className="mt-3 inline-block font-semibold text-brand underline">Ansiedad · selección piloto de cuatro temas</Link><p className="mt-2 text-sm leading-6 text-slate-600">La selección es parcial. Las referencias a ambos sistemas no implican equivalencia diagnóstica ni conversión automática de códigos.</p></section>
  </main>;
}
