export type SourceSection = { id: string; title: string; locator: string; kind: "foundation" | "clinical" | "assessment" | "coding" | "research"; familyId?: string };
export type SourceRecord = {
  id: string; title: string; edition: string; scope: string; coverageNotice: string;
  indexPdfPages: string; officialUrl: string; sections: SourceSection[];
};

const dsmFamilies = [
  ["neurodesarrollo", "Neurodesarrollo", "35"],
  ["psicoticos", "Espectro psicótico", "101"],
  ["bipolaridad", "Bipolaridad y relacionados", "139"],
  ["depresivos", "Trastornos depresivos", "177"],
  ["ansiedad", "Ansiedad", "215"],
  ["obsesivo-compulsivo", "Obsesivo-compulsivo y relacionados", "263"],
  ["trauma", "Trauma y factores de estrés", "295"],
  ["disociativos", "Disociación", "329"],
  ["somaticos", "Síntomas somáticos y relacionados", "349"],
  ["alimentacion", "Alimentación e ingesta", "371"],
  ["excrecion", "Excreción", "399"],
  ["sueno", "Sueño y vigilia", "407"],
  ["disfunciones-sexuales", "Disfunciones sexuales", "477"],
  ["disforia-genero", "Disforia de género — ubicación del DSM", "511"],
  ["conducta", "Trastornos disruptivos, de impulsos y conducta", "521"],
  ["sustancias", "Sustancias y adicciones", "543"],
  ["neurocognitivos", "Neurocognición", "667"],
  ["personalidad", "Personalidad", "733"],
  ["parafilicos", "Trastornos parafílicos", "779"],
  ["otros-trastornos", "Otros trastornos y códigos adicionales", "803"],
  ["efectos-adversos", "Trastornos motores y efectos adversos de medicamentos", "807"],
  ["atencion-clinica", "Otros problemas objeto de atención clínica", "821"],
] as const;

export const sources: SourceRecord[] = [
  {
    id: "dsm-5-tr", title: "DSM-5-TR", edition: "5.ª edición, texto revisado · versión española aportada",
    scope: "Fundamentos, familias clínicas y medidas y modelos emergentes.",
    coverageNotice: "Índice orientativo con rótulos abreviados. Los códigos de la clasificación del ejemplar aportado son CIE-10-MC, no CIE-11. Las fichas no reproducen el manual completo.",
    indexPdfPages: "6–7 (v–vi impresas)", officialUrl: "https://www.psychiatry.org/psychiatrists/practice/dsm",
    sections: [
      { id: "fundamentos", title: "I. Fundamentos y utilización del manual", locator: "Sección I · pp. 5–29", kind: "foundation" },
      ...dsmFamilies.map(([id, title, page]): SourceSection => ({ id, title, locator: `Sección II · p. ${page}`, kind: "clinical", ...(id === "ansiedad" ? { familyId: "ansiedad" } : {}) })),
      { id: "evaluacion", title: "III. Medidas de evaluación", locator: "p. 841", kind: "assessment" },
      { id: "cultura", title: "Cultura y diagnóstico", locator: "p. 859", kind: "foundation" },
      { id: "modelo-personalidad", title: "Modelo alternativo de personalidad", locator: "p. 881", kind: "research" },
      { id: "en-estudio", title: "Afecciones que necesitan más estudio", locator: "p. 903", kind: "research" },
      { id: "indices", title: "Apéndices e índices de consulta", locator: "Desde p. 927", kind: "coding" },
    ],
  },
  {
    id: "cie-11-guia-2024", title: "CIE-11 · Guía de referencia", edition: "Guía en español · portada de mayo de 2024",
    scope: "Selección de secciones sobre introducción, uso y novedades de la clasificación internacional.",
    coverageNotice: "Esta guía explica la estructura y la codificación. No es el catálogo completo de diagnósticos ni reemplaza las descripciones clínicas y requisitos diagnósticos. La fecha de la guía no fija una versión de los códigos.",
    indexPdfPages: "2–15", officialUrl: "https://icd.who.int/",
    sections: [
      { id: "introduccion", title: "1. Introducción a la CIE-11", locator: "Parte 1", kind: "foundation" },
      { id: "uso", title: "2. Uso de la clasificación y convenciones", locator: "Parte 2 · §§ 2.1–2.10", kind: "coding" },
      { id: "funcionamiento", title: "Funcionamiento y evaluación", locator: "§ 2.11", kind: "assessment" },
      { id: "morbilidad", title: "Codificación de la morbilidad", locator: "§ 2.23", kind: "coding" },
      { id: "novedades", title: "3. Novedades, capítulos y mantenimiento", locator: "Parte 3", kind: "foundation" },
      { id: "capitulo-06", title: "Capítulo 06 · Salud mental, comportamiento y neurodesarrollo", locator: "§ 3.2.6 · p. 328", kind: "clinical", familyId: "ansiedad" },
      { id: "capitulo-07", title: "Capítulo 07 · Sueño y vigilia", locator: "§ 3.2.7 · p. 333", kind: "clinical" },
      { id: "capitulo-17", title: "Capítulo 17 · Salud sexual", locator: "§ 3.2.17 · p. 342", kind: "clinical" },
      { id: "anexos", title: "Historia, mantenimiento y diferencias con CIE-10", locator: "§§ 3.12–3.15", kind: "coding" },
    ],
  },
];

export const anxietyFamily = {
  id: "ansiedad", title: "Ansiedad", sourceId: "dsm-5-tr", sourceSection: "Sección II · Trastornos de ansiedad",
  printedPage: 215,
  topics: [
    { id: "trastorno-de-panico", label: "Trastorno de pánico" },
    { id: "tag", label: "Trastorno de ansiedad generalizada" },
    { id: "ansiedad-social", label: "Trastorno de ansiedad social" },
    { id: "fobia-especifica", label: "Fobia específica" },
  ],
};

export const pilotTopicIds: ReadonlySet<string> = new Set(anxietyFamily.topics.map(topic => topic.id));
export const getSource = (id: string) => sources.find(source => source.id === id);
