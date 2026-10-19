import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Concept } from "@/types/content";
import { getCategory } from "@/lib/content";
export function ConceptCard({ concept }: { concept: Concept }) {
 return <Link href={`/conceptos/${concept.slug}`} className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
 <div className="mb-4 flex items-center justify-between"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">{getCategory(concept.category)?.title}</span><ArrowUpRight size={18} className="text-slate-400 transition group-hover:text-brand"/></div>
 <h3 className="mb-2 text-lg font-semibold text-deep">{concept.title}</h3><p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{concept.summary}</p>
 <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"><BookOpen size={16}/> Leer concepto</span>
 </Link>;
}
