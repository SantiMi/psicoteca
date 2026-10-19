import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
export const metadata: Metadata = { title: { default: "Psicoteca | Psicología y Psiquiatría", template: "%s | Psicoteca" }, description: "Biblioteca gratuita de consulta rápida sobre Psicología y Psiquiatría." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body className="min-h-screen bg-canvas text-slate-900 antialiased"><SiteHeader/>{children}<footer className="mx-auto mt-24 max-w-6xl border-t border-slate-200 px-5 py-8 text-sm text-slate-500 sm:px-8"><div className="flex flex-wrap justify-between gap-3"><span>© Psicoteca · Biblioteca abierta y gratuita</span><span>Material informativo. No reemplaza evaluación profesional.</span></div></footer></body></html>; }
