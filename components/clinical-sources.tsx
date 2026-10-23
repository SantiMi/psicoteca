import {getClinicalSources} from "@/data/clinical";
export function ClinicalSources({ids}: {ids: string[]}) {
  return <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">{getClinicalSources(ids).map(source => <li key={source.id}><a className="font-semibold text-brand underline underline-offset-2" href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul>;
}
