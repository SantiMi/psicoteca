import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
export const metadata: Metadata = { title: { default: "Psicoteca | Psicología y Psiquiatría", template: "%s | Psicoteca" }, description: "Biblioteca gratuita de consulta rápida sobre Psicología y Psiquiatría." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body className="min-h-screen bg-canvas text-slate-900 antialiased"><SiteHeader/>{children}<footer className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-between gap-3 px-5 py-8 text-xs leading-6 text-slate-400 sm:px-8"><span>Psicoteca · Información educativa en revisión</span><a href="/clasificaciones" className="underline underline-offset-4">Fuentes y alcance</a></footer></body></html>; }
