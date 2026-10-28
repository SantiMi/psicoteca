"use client";
import {useEffect, useState, type ReactNode} from "react";
import Link from "next/link";
import {ArrowLeftRight} from "lucide-react";
import {comparisonOptions, type ComparisonKind} from "@/data/comparison-options";
import {getDrugProfile, getPathologyProfile} from "@/data/clinical";
import {therapies} from "@/data/comparisons";
import {findDifferential} from "@/data/differentials";
import {ClinicalSources} from "@/components/clinical-sources";
import {DifferentialCard} from "@/components/differential-card";

type Props = {kind: ComparisonKind; a: string; b: string};
type Row = {label: string; values: [ReactNode, ReactNode]};
const bullets = (items: string[]) => <ul className="list-disc space-y-2 pl-5">{items.map(item => <li key={item}>{item}</li>)}</ul>;
export function ComparisonTool({kind: initialKind, a: initialA, b: initialB}: Props) {
  const [kind, setKind] = useState(initialKind); const [a, setA] = useState(initialA); const [b, setB] = useState(initialB);
  const options = comparisonOptions[kind];
  const selected = [options.find(item => item.id === a)!, options.find(item => item.id === b)!];
  useEffect(() => {const query = new URLSearchParams({kind,a,b}); window.history.replaceState(null,"",`/comparar?${query}`);}, [kind,a,b]);
  function changeKind(next: ComparisonKind) {setKind(next); setA(comparisonOptions[next][0].id); setB(comparisonOptions[next][1].id);}
  let rows: Row[];
  if (kind === "farmacos") {
    const pair = [getDrugProfile(a)!,getDrugProfile(b)!] as const;
    rows = [
      {label:"Familia",values:pair.map(item => item.family) as [string,string]},
      {label:"Usos documentados",values:pair.map(item => item.uses) as [string,string]},
      {label:"Efecto esperado",values:pair.map(item => item.expected) as [string,string]},
      {label:"Tiempo de respuesta",values:pair.map(item => item.onset) as [string,string]},
      {label:"Efectos adversos posibles",values:pair.map(item => bullets(item.adverse)) as [ReactNode,ReactNode]},
      {label:"Precauciones",values:pair.map(item => item.cautions) as [string,string]},
      {label:"Recomendaciones generales",values:pair.map(item => bullets(item.recommendations)) as [ReactNode,ReactNode]},
      {label:"Bibliografía",values:pair.map(item => <ClinicalSources key={item.id} ids={item.sourceIds}/>) as [ReactNode,ReactNode]},
    ];
  } else if (kind === "trastornos") {
    const pair = [getPathologyProfile(a)!,getPathologyProfile(b)!] as const;
    rows = [
      {label:"Lo esencial",values:pair.map(item => bullets(item.essentials)) as [ReactNode,ReactNode]},
      {label:"Para profundizar",values:pair.map(item => <div className="space-y-3">{item.deep.map(section => <p key={section.heading}><strong>{section.heading}: </strong>{section.text}</p>)}</div>) as [ReactNode,ReactNode]},
      {label:"Psicofarmacología asociada",values:pair.map(item => <><p>{item.medication.summary}</p><ClinicalSources ids={item.medication.sourceIds}/></>) as [ReactNode,ReactNode]},
      {label:"Bibliografía",values:pair.map(item => <ClinicalSources key={item.id} ids={item.sourceIds}/>) as [ReactNode,ReactNode]},
    ];
  } else {
    const pair = [therapies.find(item => item.id === a)!,therapies.find(item => item.id === b)!] as const;
    rows = [
      {label:"En pocas palabras",values:[pair[0].oneLine,pair[1].oneLine]},
      {label:"Fundamentos y técnicas",values:[bullets(pair[0].points),bullets(pair[1].points)]},
      {label:"Aplicaciones y evidencia",values:[pair[0].uses,pair[1].uses]},
      {label:"Recaudos",values:[pair[0].cautions,pair[1].cautions]},
      {label:"Bibliografía",values:pair.map(item => <ul>{item.sources.map(source => <li key={source.url}><a className="text-brand underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>) as [ReactNode,ReactNode]},
    ];
  }
  const differential = kind === "trastornos" ? findDifferential(a,b) : undefined;
  const table = <>
<p className="mt-5 text-xs text-slate-500 lg:hidden">Deslizá la tabla horizontalmente para ver ambas columnas.</p>
    <div role="region" aria-label="Comparación lado a lado" tabIndex={0} className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white focus:outline-brand"><table className="w-full min-w-[600px] table-fixed border-collapse text-left text-sm leading-7"><caption className="sr-only">Comparación entre {selected[0].name} y {selected[1].name}</caption><thead><tr className="bg-blue-50 text-deep"><th scope="col" className="w-1/4 p-4">Aspecto</th>{selected.map(item => <th key={item.id} scope="col" className="w-[37.5%] break-words p-4 text-lg"><Link href={`/ficha/${item.id}`} className="underline decoration-blue-200 underline-offset-4">{item.name}</Link></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.label} className="border-t border-slate-200 align-top"><th scope="row" className="break-words p-4 font-bold text-deep">{row.label}</th>{row.values.map((value,index) => <td key={index} className="break-words p-4 text-slate-700">{value}</td>)}</tr>)}</tbody></table></div>
  </>;
  return <>
    <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Tipo de comparación">{([{id:"trastornos",label:"Patologías"},{id:"farmacos",label:"Psicofármacos"},{id:"terapias",label:"Psicoterapias"}] as const).map(item => <button type="button" key={item.id} aria-pressed={kind === item.id} onClick={() => changeKind(item.id)} className={`rounded-xl px-5 py-3 text-sm font-bold ${kind === item.id ? "bg-brand text-white" : "border border-slate-200 bg-white text-deep"}`}>{item.label}</button>)}</div>
    <div className="mt-6 grid items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto_1fr]">
      <label className="min-w-0 font-semibold text-deep">Primera ficha<select aria-label="Primera ficha" value={a} onChange={e => setA(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal">{options.map(item => <option key={item.id} value={item.id} disabled={item.id === b}>{item.name}</option>)}</select></label>
      <button type="button" aria-label="Intercambiar elementos" onClick={() => {setA(b);setB(a);}} className="mx-auto rounded-xl bg-blue-50 p-3 text-brand"><ArrowLeftRight aria-hidden="true" size={20}/></button>
      <label className="min-w-0 font-semibold text-deep">Segunda ficha<select aria-label="Segunda ficha" value={b} onChange={e => setB(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal">{options.map(item => <option key={item.id} value={item.id} disabled={item.id === a}>{item.name}</option>)}</select></label>
    </div>
    {kind === "farmacos" && <p className="mt-5 text-sm leading-7 text-slate-600">Se muestran usos descritos en las fuentes, no un ranking de eficacia ni de frecuencia de prescripción. Las indicaciones dependen del país, edad y presentación; las fuentes farmacológicas citadas son de EE. UU.</p>}
    {kind === "trastornos" && <section className="mt-8" aria-labelledby="differential-heading"><h2 id="differential-heading" className="mb-4 text-2xl font-bold text-deep">Principales diferencias</h2>{differential ? <DifferentialCard differential={differential} firstId={a}/> : <p className="rounded-xl bg-slate-100 p-5 text-sm leading-7">Todavía no hay una comparación diferencial documentada para este par. La tabla permite consultar las características de cada ficha, pero no se infiere un diferencial a partir de similitudes de palabras.</p>}</section>}
    {kind === "trastornos" ? <details className="mt-6 border-t border-slate-200 pt-5"><summary className="cursor-pointer font-semibold text-deep">Ampliar las características de cada cuadro</summary>{table}</details> : table}

    <aside className="mt-7 text-xs leading-6 text-slate-500">Síntesis educativas pendientes de revisión especializada. No establecen diagnósticos ni permiten elegir, cambiar o suspender un tratamiento. {kind === "farmacos" && "Los efectos adversos mostrados no son exhaustivos: consultá las advertencias y precauciones completas de cada fuente."}</aside>
  </>;
}
