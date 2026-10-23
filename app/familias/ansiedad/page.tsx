import Link from "next/link";
import {anxietyFamily} from "@/data/organization";
import {fetchCatalogItem} from "@/lib/cloud-catalog";

export const metadata = {title: "Ansiedad"};
export const dynamic = "force-dynamic";
export default async function AnxietyPage() {
  const topics = await Promise.all(anxietyFamily.topics.map(topic => fetchCatalogItem(topic.id)));
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
    <Link href="/clasificaciones" className="text-sm font-semibold text-brand">← Explorar por fuentes</Link>
    <p className="mt-9 text-xs font-bold uppercase tracking-wider text-brand">Psicopatologías · Familia piloto</p><h1 className="mt-3 text-4xl font-extrabold text-deep">Ansiedad</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Una selección inicial de temas para recorrer la biblioteca. Las fichas educativas están sujetas a revisión editorial.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{topics.filter(topic => topic !== null).map(topic => <Link key={topic.id} href={`/ficha/${topic.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand"><h2 className="text-lg font-bold text-deep">{topic.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{topic.summary}</p><span className="mt-4 inline-block text-sm font-semibold text-brand">Consultar ficha →</span></Link>)}</div>
    {!topics.some(Boolean) && <p className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-600">Todavía no hay fichas disponibles para esta familia.</p>}
    <section className="mt-9 rounded-2xl bg-blue-50 p-6"><h2 className="font-bold text-deep">Ubicación en las fuentes</h2><ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
      <li><Link className="font-semibold text-brand underline" href="/clasificaciones/dsm-5-tr#ansiedad">DSM-5-TR · Sección II, ansiedad</Link><span> · p. 215, inicio del capítulo.</span></li>
      <li><Link className="font-semibold text-brand underline" href="/clasificaciones/cie-11-guia-2024#capitulo-06">Guía CIE-11 · estructura del capítulo 06</Link><span> · § 3.2.6, p. 328. El contenido diagnóstico específico queda pendiente de una fuente clínica suficiente.</span></li>
    </ul><p className="mt-4 text-xs leading-6 text-slate-600">Estos enlaces indican contexto de clasificación; no son una tabla de equivalencias ni acreditan la revisión de cada diagnóstico.</p></section>
  </main>;
}
