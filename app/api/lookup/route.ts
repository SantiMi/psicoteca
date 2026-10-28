import {NextRequest, NextResponse} from "next/server";
import {library} from "@/data/catalog";
import {resolveSearchIntent} from "@/data/search-intent";
import {getPathologyProfile, getDrugProfile, getClinicalSources} from "@/data/clinical";
import {getDifferentialsFor, findDifferential} from "@/data/differentials";
import {fetchCatalogItem, cloudEnabled, searchCatalog} from "@/lib/cloud-catalog";
import type {LookupResult} from "@/types/lookup";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateResponse = (result: LookupResult) => NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0,180);
  const result: LookupResult = {kind:"empty",query,heading:"Todavía no tenemos una explicación para esa consulta.",items:[]};
  if (query.length < 2) return privateResponse(result);
  try {
    const intent = resolveSearchIntent(query,library);
    const candidates = (await Promise.all(intent.ids.map(id => fetchCatalogItem(id)))).filter(item => item !== null);
    result.items = candidates.map(item => ({id:item.id,title:item.title,summary:item.summary,href:`/ficha/${item.id}`}));
    if (!candidates.length && cloudEnabled()) {
      const fallback = await searchCatalog(query);
      result.items = fallback.items.slice(0,5).map(item => ({id:item.id,title:item.title,summary:item.summary,href:`/ficha/${item.id}`}));
    }
    if (!candidates.length) {
      if (result.items.length) {result.kind="choices"; result.heading="Temas disponibles relacionados con tu consulta";}
      return privateResponse(result);
    }
    if (intent.kind === "comparison" && candidates.length === 2) {
      const [first,second] = candidates;
      const drugs = first.category === "psicofarmacologia" && second.category === first.category;
      const differential = !cloudEnabled() && !drugs ? findDifferential(first.id,second.id) : undefined;
      result.kind="comparison"; result.heading=`${first.title} y ${second.title}`;
      result.comparison = {
        shared:differential?.shared ?? [], documented:Boolean(differential) || (!cloudEnabled() && drugs),
        columns:candidates.map(item => {
          const drug = !cloudEnabled() && drugs ? getDrugProfile(item.id) : undefined;
          const points = drug ? (/advers|secundari/.test(query.toLowerCase()) ? drug.adverse : [drug.uses,drug.expected]) : differential ? (differential.a === item.id ? differential.distinguishA : differential.distinguishB) : [item.summary];
          return {title:item.title,points};
        }),
        href:`/comparar?kind=${drugs ? "farmacos" : "trastornos"}&a=${first.id}&b=${second.id}`,
        sources:differential ? differential.sources.map(source=>({label:source.title,url:source.url})) : !cloudEnabled() && drugs ? getClinicalSources([...new Set(candidates.flatMap(item=>getDrugProfile(item.id)?.sourceIds ?? []))]).map(source=>({label:source.label,url:source.url})) : [],
      };
    } else if ((intent.kind === "definition" || intent.kind === "medication") && candidates.length === 1) {
      const item = candidates[0];
      const profile = !cloudEnabled() ? getPathologyProfile(item.id) : undefined;
      const drug = !cloudEnabled() ? getDrugProfile(item.id) : undefined;
      const medication = intent.kind === "medication" && profile;
      const sources = getClinicalSources(medication ? profile.medication.sourceIds : profile?.sourceIds ?? drug?.sourceIds ?? []);
      result.kind="answer"; result.heading=medication ? `Medicación y ${item.title.toLowerCase()}` : item.title;
      const links = medication ? profile.medication.examples.map(example => ({label:getDrugProfile(example.drugId)?.name ?? example.drugId,href:`/ficha/${example.drugId}`})) : profile ? getDifferentialsFor(item.id).slice(0,2).map(d => {const other = library.find(topic => topic.id === (d.a === item.id ? d.b : d.a))!;return {label:`Diferencias con ${other.title.toLowerCase()}`,href:`/comparar?kind=trastornos&a=${item.id}&b=${other.id}`};}) : [];
      result.answer={title:item.title,summary:medication ? profile.medication.summary : drug && /advers|secundari|efectos/.test(query.toLowerCase()) ? drug.expected : item.summary,points:medication ? [profile.medication.note] : drug ? (/advers|secundari/.test(query.toLowerCase()) ? drug.adverse : [drug.uses,drug.onset]) : (profile?.essentials ?? item.essentials).slice(0,3),href:`/ficha/${item.id}${medication ? "#medicacion" : ""}`,links,sources:sources.map(source => ({label:source.label,url:source.url}))};
    } else {result.kind="choices";result.heading="¿Sobre cuál de estos temas querés leer?";}
    return privateResponse(result);
  } catch {return NextResponse.json({error:"No pudimos consultar la biblioteca. Intentá nuevamente."},{status:503,headers:{"Cache-Control":"no-store"}});}
}
