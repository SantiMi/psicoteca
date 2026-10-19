import Link from "next/link";
import { BookOpenText } from "lucide-react";
export function SiteHeader() {
 return <header className="border-b border-slate-200/75 bg-white/90"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
 <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-deep" aria-label="Psicoteca, inicio"><span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white"><BookOpenText size={21}/></span>Psicoteca</Link>
 <span className="hidden text-sm text-slate-500 sm:block">Tu biblioteca de consulta rápida</span>
 </div></header>;
}
