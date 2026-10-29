import Link from "next/link";
import {AnimatedLogo} from "@/components/animated-logo";
export function SiteHeader() {return <header><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8"><AnimatedLogo/><Link href="/" className="text-sm text-slate-500 hover:text-brand">Buscar</Link></div></header>;}
