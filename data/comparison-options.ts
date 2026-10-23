import {disorders, therapies} from "@/data/comparisons";
import {canonicalPathologyId, drugProfiles} from "@/data/clinical";
export type ComparisonKind = "trastornos" | "farmacos" | "terapias";
export const comparisonOptions = {
  trastornos: [...disorders.map(d => ({id:d.id,name:d.name})), {id:"depresion",name:"Depresión"}],
  farmacos: drugProfiles.map(d => ({id:d.id,name:d.name})),
  terapias: therapies.map(d => ({id:d.id,name:d.name})),
};
export function resolveComparison(query: {kind?: string; a?: string; b?: string}) {
  const kind: ComparisonKind = query.kind === "farmacos" || query.kind === "terapias" ? query.kind : "trastornos";
  const items = comparisonOptions[kind];
  const requestedA = kind === "trastornos" ? canonicalPathologyId(query.a ?? "") : query.a;
  const requestedB = kind === "trastornos" ? canonicalPathologyId(query.b ?? "") : query.b;
  const a = items.some(i => i.id === requestedA) ? requestedA! : items[0].id;
  const b = requestedB !== a && items.some(i => i.id === requestedB) ? requestedB! : items.find(i => i.id !== a)!.id;
  return {kind, a, b};
}
