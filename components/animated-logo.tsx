"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
export function AnimatedLogo(){
 const [playing,setPlaying]=useState(false);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current)},[]);
 const trigger=()=>{if(typeof window!=="undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;setPlaying(false);requestAnimationFrame(()=>setPlaying(true));if(timeout.current)clearTimeout(timeout.current);timeout.current=setTimeout(()=>setPlaying(false),2100);};
 return <Link href="/" aria-label="Psicoteca, ir al inicio" onPointerEnter={trigger} onFocus={trigger} onClick={trigger} className={`psicoteca-logo ${playing?"is-playing":""}`}><span className="psicoteca-logo-full" aria-hidden="true">PSICOTECA<span className="text-brand">.</span></span><span className="psicoteca-logo-mark" aria-hidden="true"><span className="psicoteca-psi">psi</span><svg className="psicoteca-book" viewBox="0 0 68 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path className="book-back" d="M5 11V42Q19 37 34 46Q49 37 63 42V11" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round"/><path className="book-left" d="M34 43Q21 33 9 36V4Q23 2 34 13V43Z" fill="#fff" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round"/><path className="book-right" d="M34 43Q47 33 59 36V4Q45 2 34 13V43Z" fill="#fff" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round"/><path className="book-page" d="M34 42Q41 28 52 23V8Q41 11 34 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M34 43V13" stroke="currentColor" strokeWidth="2"/></svg></span></Link>;
}