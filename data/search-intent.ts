import type {LibraryItem} from "@/data/catalog";

export type SearchIntent = {kind: "definition" | "medication" | "comparison" | "choices" | "empty"; ids: string[]};
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stopWords = new Set(["que","es","el","la","los","las","un","una","de","del","sobre","para","como","cual","cuales","se","usa","usan","con","y","o","en","entre","diferencia","diferencias","diferencial","diagnostico","comparar","comparacion","vs","versus","efectos","efecto","medicacion","medicamentos","tratamiento","trastorno","trastornos","patologia","patologias","adversos","secundarios"]);
const extraAliases: Record<string, string[]> = {
  "tag": ["tag","ansiedad generalizada"],
  "trastorno-de-panico": ["panico","trastorno de panico"],
  "ansiedad-social": ["ansiedad social","fobia social"],
  "fobia-especifica": ["fobia especifica"],
};
const broadAliases = new Set(["ansiedad","depresion","sintomas","miedo","farmacologia","medicacion","diagnostico","evaluacion","psicoterapia","psicologia","clasificacion","escala","cuestionario","salud mental","tratamiento","vinculo","infancia","desarrollo","teoria","isrs","antidepresivo"]);

// Resolves requests against known topics only. It does not infer diagnoses from symptoms.
export function resolveSearchIntent(query: string, items: LibraryItem[]): SearchIntent {
  const q = normalize(query).slice(0,180);
  if (q.length < 2) return {kind:"empty",ids:[]};
  const padded = ` ${q} `;
  const mentions = items.map(item => {
    const aliases = [item.title, item.id.replace(/-/g," "), ...item.synonyms.filter(alias => !broadAliases.has(normalize(alias))), ...(extraAliases[item.id] ?? [])].map(normalize).filter(alias => alias.length >= 3);
    const matches = aliases.filter(alias => padded.includes(` ${alias} `));
    return {item, position:matches.length ? Math.min(...matches.map(alias => padded.indexOf(` ${alias} `))) : -1};
  }).filter(match => match.position >= 0).sort((a,b) => a.position - b.position);
  const ids = [...new Set(mentions.map(match => match.item.id))];
  const genericAnxiety = /\bansiedad\b/.test(q) && !/\bansiedad (generalizada|social)\b/.test(q);
  if (ids.length >= 2) {
    const first = items.find(item => item.id === ids[0])!;
    const second = items.find(item => item.id === ids[1])!;
    const comparable = first.category === second.category && ["psicopatologias","psicofarmacologia"].includes(first.category);
    return {kind:comparable && ids.length === 2 ? "comparison" : "choices",ids:ids.slice(0,5)};
  }
  if (ids.length === 1 && !(genericAnxiety && /\b(diferencia|diferencias|comparar|vs|versus|o)\b/.test(q))) {
    const item = items.find(candidate => candidate.id === ids[0])!;
    const medication = item.category === "psicopatologias" && /\b(medicacion|medicamentos?|farmacos?|sustancias?|tratamiento farmacologico)\b/.test(q);
    return {kind:medication ? "medication" : "definition",ids};
  }
  const terms = q.split(" ").filter(term => term.length >= 3 && !stopWords.has(term));
  const matches = items.map(item => {
    const title = normalize(item.title + " " + item.synonyms.join(" "));
    const body = normalize(item.summary + " " + item.family);
    const score = terms.reduce((sum,term) => sum + (title.includes(term) ? 5 : body.includes(term) ? 1 : 0),0);
    return {id:item.id,score};
  }).filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0,5);
  return {kind:matches.length ? "choices" : "empty",ids:matches.map(item => item.id)};
}
