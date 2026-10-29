import Link from "next/link";
import {ComparisonTool} from "@/components/comparison-tool";
import {resolveComparison} from "@/data/comparison-options";
export const metadata = {title:"Comparar patologías y psicofármacos"};
type Props = {searchParams: Promise<Record<string, string | string[] | undefined>>};
export default async function ComparePage({searchParams}: Props) {
 const query = await searchParams;
 const selection = resolveComparison({kind:typeof query.kind === "string" ? query.kind : undefined,a:typeof query.a === "string" ? query.a : undefined,b:typeof query.b === "string" ? query.b : undefined});
 return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><Link href="/" className="text-sm font-semibold text-brand">← Volver al buscador</Link><h1 className="mt-8 text-3xl font-extrabold text-deep sm:text-4xl">Comparar para comprender</h1><p className="mt-4 max-w-3xl leading-7 text-slate-600">Contrastá las características de dos patologías o los usos, efectos y precauciones de dos psicofármacos. Cada síntesis incluye sus fuentes.</p><ComparisonTool key={`${selection.kind}-${selection.a}-${selection.b}`} {...selection}/></main>;
}
