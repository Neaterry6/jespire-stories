'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
export default function ThemeToggle(){const[dark,setDark]=useState(false);useEffect(()=>{const d=localStorage.getItem('jespire-theme')==='dark';setDark(d);document.documentElement.classList.toggle('dark',d)},[]);function toggle(){const next=!dark;setDark(next);localStorage.setItem('jespire-theme',next?'dark':'light');document.documentElement.classList.toggle('dark',next)}return <button onClick={toggle} aria-label="Toggle dark mode" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>}
