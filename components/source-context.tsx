import Link from "next/link";
import {pilotTopicIds} from "@/data/organization";

export function SourceContext({itemId}: {itemId: string}) {
  if (itemId === "dsm-5-tr" || itemId === "cie-11") {
    const sourceId = itemId === "cie-11" ? "cie-11-guia-2024" : itemId;
    return <section className="mt-6 rounded-2xl bg-blue-50 p-6"><h2 className="font-bold text-deep">Explorar esta fuente</h2><Link className="mt-3 inline-block font-semibold text-brand underline" href={`/clasificaciones/${sourceId}`}>Recorrer su índice y las secciones disponibles →</Link></section>;
  }
  if (!pilotTopicIds.has(itemId)) return null;
  return <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8" aria-labelledby="source-context-title">
    <h2 id="source-context-title" className="text-lg font-bold text-deep">Consultar por clasificación</h2>
    <p className="mt-3 text-sm leading-7 text-slate-700">Esta ficha forma parte de la <Link href="/familias/ansiedad" className="font-semibold text-brand underline">familia piloto de ansiedad</Link>. El resumen educativo y las fuentes de clasificación se revisan por separado.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-4"><h3 className="font-semibold text-deep">Según DSM-5-TR</h3><p className="mt-2 text-sm leading-6 text-slate-600">Síntesis diagnóstica pendiente de revisión de la fuente.</p><Link href="/clasificaciones/dsm-5-tr#ansiedad" className="mt-3 inline-block text-sm font-semibold text-brand underline">Ver ubicación del capítulo</Link></div>
      <div className="rounded-xl bg-white p-4"><h3 className="font-semibold text-deep">Según CIE-11</h3><p className="mt-2 text-sm leading-6 text-slate-600">Contenido pendiente de una fuente clínica suficiente y una versión definida de la clasificación.</p><Link href="/clasificaciones/cie-11-guia-2024#capitulo-06" className="mt-3 inline-block text-sm font-semibold text-brand underline">Consultar estructura de la guía</Link></div>
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-600">La comparación entre sistemas está pendiente. No se asignaron equivalencias ni códigos automáticamente.</p>
  </section>;
}
