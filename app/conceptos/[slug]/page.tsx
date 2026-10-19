import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, AlertCircle } from "lucide-react";
import { concepts } from "@/data/concepts";
import { getCategory, getConcept } from "@/lib/content";
import { ConceptTabs } from "@/components/concept-tabs";
import { ConceptCard } from "@/components/concept-card";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return concepts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const concept = getConcept(slug); return { title: concept?.title ?? "Concepto no encontrado" }; }
export default async function ConceptPage({ params }: Props) {
 const { slug } = await params; const concept = getConcept(slug); if (!concept) notFound();
 const related = concept.related.map(getConcept).filter((x): x is NonNullable<typeof x> => Boolean(x));
 return <main className="mx-auto max-w-5xl px-5 pb-10 pt-10 sm:px-8"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft size={16}/> Volver a explorar</Link>
 <div className="mb-9 mt-9"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand">{getCategory(concept.category)?.title}</span><h1 className="mt-5 text-4xl font-bold tracking-tight text-deep sm:text-5xl">{concept.title}</h1><p className="mt-3 max-w-2xl text-slate-500">Del resumen a la lectura en profundidad, a tu ritmo.</p></div>
 <ConceptTabs concept={concept}/>
 {concept.reviewNotice && <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><AlertCircle size={20} className="mt-0.5 shrink-0"/><p><strong>Estado editorial:</strong> {concept.reviewNotice}</p></div>}
 {related.length > 0 && <section className="mt-14"><h2 className="mb-6 text-2xl font-bold text-deep">Temas relacionados</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map(item => <ConceptCard key={item.slug} concept={item}/>)}</div></section>}
 <Link href="/" className="mt-10 inline-flex items-center gap-2 font-semibold text-brand hover:underline">Seguir explorando <ArrowUpRight size={17}/></Link>
 </main>;
}
