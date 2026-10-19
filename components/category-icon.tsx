import { Brain, MessagesSquare, ClipboardList, Pill, Sprout, LibraryBig } from "lucide-react";
import type { CategorySlug } from "@/types/content";
const styles = { psicopatologia: "bg-sky-50 text-sky-700", psicoterapia: "bg-violet-50 text-violet-700", evaluacion: "bg-amber-50 text-amber-700", psicofarmacologia: "bg-rose-50 text-rose-700", desarrollo: "bg-emerald-50 text-emerald-700", teoria: "bg-indigo-50 text-indigo-700" };
const icons = { psicopatologia: Brain, psicoterapia: MessagesSquare, evaluacion: ClipboardList, psicofarmacologia: Pill, desarrollo: Sprout, teoria: LibraryBig };
export function CategoryIcon({ category }: { category: CategorySlug }) { const Icon = icons[category]; return <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${styles[category]}`}><Icon size={23} strokeWidth={1.8}/></span>; }
