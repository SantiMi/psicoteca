export const fourCategories=[
 {id:"psicopatologias",title:"Psicopatologías",subtitle:"Trastornos y diagnósticos",color:"bg-sky-50",symbol:"brain"},
 {id:"psicofarmacologia",title:"Psicofarmacología",subtitle:"Principios activos y familias",color:"bg-rose-50",symbol:"pill"},
 {id:"teoria",title:"Teoría",subtitle:"Conceptos y modelos",color:"bg-indigo-50",symbol:"book"},
 {id:"evaluaciones",title:"Evaluaciones",subtitle:"Instrumentos y entrevistas",color:"bg-amber-50",symbol:"clipboard"}
] as const;
export type CategoryId=(typeof fourCategories)[number]["id"];
