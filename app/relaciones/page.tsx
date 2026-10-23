import Link from "next/link";
import {differentials} from "@/data/differentials";
import {DifferentialCard} from "@/components/differential-card";
export const metadata = {title:"Vinculaciones y diagnóstico diferencial"};
export default function RelationsPage() {
 return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8"><Link href="/" className="text-sm font-semibold text-brand">← Biblioteca</Link><h1 className="mt-9 text-3xl font-extrabold text-deep sm:text-4xl">Vinculaciones y diagnóstico diferencial</h1><p className="mt-5 max-w-3xl leading-8 text-slate-600">Explorá qué comparten algunas patologías y qué ayuda a distinguirlas. Las comparaciones son síntesis editoriales con bibliografía; no equivalen a criterios completos de DSM-5-TR o CIE-11.</p><Link href="/comparar?kind=trastornos" className="mt-5 inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white">Elegir dos patologías →</Link><div className="mt-9 space-y-6">{differentials.map(d => <DifferentialCard key={d.id} differential={d}/>)}</div></main>;
}
