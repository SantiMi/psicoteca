import Link from "next/link";
import {notFound} from "next/navigation";
import {getSource, sources} from "@/data/organization";
type Props = {params: Promise<{source: string}>};
export function generateStaticParams() {return sources.map(source => ({source: source.id}));}
export async function generateMetadata({params}: Props) {const source = getSource((await params).source); return {title: source?.title ?? "Fuente no encontrada"};}
export default async function SourcePage({params}: Props) {
  const source = getSource((await params).source); if (!source) notFound();
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
    <Link href="/clasificaciones" className="text-sm font-semibold text-brand">← Clasificaciones y codificación</Link>
    <h1 className="mt-9 text-3xl font-extrabold text-deep sm:text-5xl">{source.title}</h1><p className="mt-3 text-sm text-slate-500">{source.edition}</p>
    <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 leading-7 text-deep">{source.coverageNotice}</p>
    <ol className="mt-8 space-y-3">{source.sections.map(section => <li id={section.id} key={section.id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-deep">{section.title}</h2><span className="text-xs text-slate-500">{section.locator}</span></div>
      {section.kind === "research" && <p className="mt-2 text-sm text-amber-800">Modelo alternativo o contenido en estudio: conservar su condición específica en la fuente.</p>}
      {section.familyId ? <Link href={`/familias/${section.familyId}`} className="mt-3 inline-block text-sm font-semibold text-brand underline">Ver selección piloto de ansiedad</Link> : <p className="mt-2 text-xs text-slate-500">Contenido de esta sección pendiente de incorporación.</p>}
    </li>)}</ol>
    <p className="mt-8 text-sm leading-7 text-slate-600">Referencia del índice en el PDF aportado: páginas {source.indexPdfPages}. Las páginas indicadas en las secciones corresponden a la numeración impresa.</p>
    <a href={source.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-brand underline">Consultar el sitio oficial de la fuente ↗</a>
  </main>;
}
