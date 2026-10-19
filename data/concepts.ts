import type { Concept } from "@/types/content";

// Contenido introductorio para consulta académica: no sustituye fuentes originales ni evaluación clínica.
// Antes de uso profesional o docente formal, cotejar cada ficha con la bibliografía citada.
export const concepts: Concept[] = [
  {
    slug: "trastorno-de-panico", title: "Trastorno de pánico", category: "psicopatologia", featured: true,
    tags: ["ansiedad", "crisis de pánico", "síntomas", "miedo"], synonyms: ["panico", "ataques de panico"],
    summary: "Se caracteriza por ataques de pánico inesperados y recurrentes, acompañados de preocupación persistente por nuevos ataques o cambios de conducta relacionados con ellos.",
    essentials: [
      { heading: "¿Qué es un ataque de pánico?", text: "Un episodio de miedo o malestar intenso que aumenta rápidamente y puede acompañarse de sensaciones físicas y cognitivas muy marcadas.", bullets: ["Palpitaciones, temblor o sudoración", "Sensación de falta de aire o mareo", "Temor a perder el control o morir"] },
      { heading: "¿Qué lo diferencia del trastorno?", text: "Un ataque aislado no equivale por sí solo a un trastorno de pánico. En este último, los ataques inesperados recurrentes se asocian a preocupación sostenida y/o conductas desadaptativas." },
    ],
    deeper: [
      { heading: "Comprensión clínica", text: "La anticipación de nuevos ataques y la interpretación amenazante de sensaciones corporales pueden contribuir al mantenimiento del problema. El diagnóstico requiere evaluar historia clínica, repercusión, contexto y posibles causas médicas o sustancias." },
      { heading: "Límites de esta ficha", text: "El diagnóstico diferencial y las decisiones de tratamiento requieren evaluación por profesionales habilitados; esta síntesis no es una guía diagnóstica autónoma." },
    ],
    references: [{ author: "National Institute of Mental Health (NIMH)", title: "Panic Disorder: When Fear Overwhelms", url: "https://www.nimh.nih.gov/health/publications/panic-disorder-when-fear-overwhelms" }],
    related: ["depresion", "apego"], reviewNotice: "Síntesis introductoria pendiente de revisión editorial por especialista." 
  },
  {
    slug: "depresion", title: "Depresión", category: "psicopatologia", featured: true,
    tags: ["estado de ánimo", "tristeza", "anhedonia", "salud mental"], synonyms: ["trastorno depresivo", "depresion mayor"],
    summary: "La depresión es un cuadro de salud mental que puede incluir estado de ánimo bajo y/o pérdida de interés o placer, junto con otros cambios que afectan la vida cotidiana.",
    essentials: [
      { heading: "Manifestaciones habituales", text: "Puede expresarse de modos diversos y con distinta intensidad.", bullets: ["Ánimo deprimido o pérdida de interés", "Cambios en sueño, apetito o energía", "Dificultades de concentración y sentimientos de culpa"] },
      { heading: "No es sinónimo de tristeza", text: "La tristeza es una experiencia humana; un trastorno depresivo implica patrones de síntomas, duración, deterioro e interpretación clínica contextual." }
    ],
    deeper: [
      { heading: "Mirada integral", text: "La evaluación considera factores psicológicos, biológicos y sociales. Es importante explorar afecciones médicas, tratamientos, acontecimientos vitales y otros cuadros que pueden presentar síntomas similares." },
      { heading: "Seguridad y atención", text: "Cuando existe riesgo de autolesión o suicidio, corresponde una evaluación profesional inmediata y acceso a servicios locales de urgencia." }
    ],
    references: [{ author: "World Health Organization (WHO)", title: "Depressive disorder (depression)", url: "https://www.who.int/news-room/fact-sheets/detail/depression" }],
    related: ["trastorno-de-panico", "sertralina", "apego"], reviewNotice: "Síntesis introductoria pendiente de revisión editorial por especialista."
  },
  {
    slug: "transferencia", title: "Transferencia", category: "teoria", featured: true,
    tags: ["psicoanálisis", "vínculo terapéutico", "Freud", "relación clínica"], synonyms: ["transferencia psicoanalitica"],
    summary: "En psicoanálisis, la transferencia alude al modo en que expectativas, afectos y modalidades vinculares adquieren expresión en la relación con el analista.",
    essentials: [
      { heading: "Idea central", text: "La relación analítica no es un vínculo neutro para quien consulta: en ella pueden actualizarse formas de relación y significaciones relevantes para su historia." },
      { heading: "No es una única emoción", text: "Puede incluir afectos positivos, negativos o ambivalentes. Su conceptualización cambia entre escuelas y autores psicoanalíticos." }
    ],
    deeper: [
      { heading: "Contexto teórico", text: "Freud desarrolló la transferencia como noción decisiva para comprender el trabajo analítico. Lecturas posteriores, entre ellas las de Lacan, reelaboraron su estatuto y su función dentro de la experiencia clínica." },
      { heading: "Uso clínico", text: "Su lectura exige considerar el marco teórico y la singularidad del caso; no corresponde inferirla automáticamente a partir de una conducta aislada." }
    ],
    references: [{ author: "Sigmund Freud", year: "1912", title: "La dinámica de la transferencia (Zur Dynamik der Übertragung)" }, { author: "Sigmund Freud", year: "1915", title: "Puntualizaciones sobre el amor de transferencia" }],
    related: ["apego", "depresion"], reviewNotice: "Resumen interpretativo pendiente de revisión bibliográfica y editorial; consultar los textos originales."
  },
  {
    slug: "apego", title: "Apego", category: "desarrollo", featured: true,
    tags: ["desarrollo", "vínculo", "infancia", "cuidado"], synonyms: ["teoria del apego", "attachment"],
    summary: "El apego describe vínculos afectivos significativos, especialmente el vínculo temprano con figuras de cuidado que ofrecen protección y seguridad.",
    essentials: [
      { heading: "Función del vínculo", text: "Las figuras de apego pueden funcionar como una base de seguridad desde la cual explorar el ambiente y a la cual volver ante situaciones de estrés." },
      { heading: "Patrones y contexto", text: "Los patrones de apego se estudian mediante métodos específicos y no deben deducirse a partir de un comportamiento aislado." }
    ],
    deeper: [
      { heading: "Desarrollo de la teoría", text: "John Bowlby elaboró el marco teórico del apego. Mary Ainsworth realizó contribuciones empíricas fundamentales para investigar diferencias en la conducta de apego." },
      { heading: "Precauciones", text: "Los patrones de apego no son etiquetas diagnósticas definitivas ni determinan por sí solos el destino psicológico de una persona." }
    ],
    references: [{ author: "John Bowlby", year: "1969", title: "Attachment and Loss, Vol. 1: Attachment" }, { author: "Mary D. S. Ainsworth, Mary C. Blehar, Everett Waters y Sally Wall", year: "1978", title: "Patterns of Attachment" }],
    related: ["transferencia", "depresion"], reviewNotice: "Síntesis teórica pendiente de revisión editorial por especialista."
  },
  {
    slug: "sertralina", title: "Sertralina", category: "psicofarmacologia", featured: true,
    tags: ["antidepresivo", "ISRS", "farmacología", "medicación"], synonyms: ["sertraline", "inhibidor selectivo de recaptacion de serotonina"],
    summary: "La sertralina es un medicamento antidepresivo del grupo de los inhibidores selectivos de la recaptación de serotonina (ISRS), utilizado bajo supervisión médica.",
    essentials: [
      { heading: "Grupo farmacológico", text: "Pertenece a los ISRS, una familia de medicamentos que actúa sobre mecanismos relacionados con la señalización serotoninérgica." },
      { heading: "Precaución", text: "Puede producir efectos adversos e interacciones con otros medicamentos. Su indicación, seguimiento y suspensión corresponden a profesionales prescriptores." }
    ],
    deeper: [
      { heading: "Información clínica responsable", text: "La ficha técnica oficial describe usos autorizados, contraindicaciones, precauciones, interacciones y efectos adversos. Esta biblioteca no ofrece pautas de dosificación ni recomendaciones individualizadas." },
      { heading: "Lectura complementaria", text: "Los prospectos regulatorios pueden variar por país y presentación; revisar la versión vigente correspondiente al producto y jurisdicción." }
    ],
    references: [{ author: "MedlinePlus, U.S. National Library of Medicine", title: "Sertraline", url: "https://medlineplus.gov/druginfo/meds/a697048.html" }],
    related: ["depresion", "trastorno-de-panico"], reviewNotice: "Información general pendiente de revisión por profesional de psiquiatría/farmacología. No utilizar para prescribir."
  }
];
