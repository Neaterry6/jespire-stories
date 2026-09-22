import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, MessageCircle, UserRound } from 'lucide-react'
import AppTabs from '@/components/app-tabs'
import ThemeToggle from '@/components/theme-toggle'
const inter=Inter({subsets:['latin'],variable:'--font-inter'});const playfair=Playfair_Display({subsets:['latin'],variable:'--font-playfair'})
export const metadata:Metadata={title:'Jespire — Stories that stay',description:'A quiet place for stories.',icons:{icon:'/jespire-logo.svg'}}
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${inter.variable} ${playfair.variable} bg-[#f7faff] text-slate-900 dark:bg-[#070d19] dark:text-slate-100`}><header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#070d19]/95"><nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Link href="/" aria-label="Jespire home"><Image src="/jespire-logo.svg" alt="Jespire" width={142} height={41} priority className="jespire-logo h-9 w-auto"/></Link><div className="flex items-center gap-1"><Link href="/community" aria-label="Community" className="rounded-full p-2.5 text-slate-800 hover:bg-blue-50 dark:text-slate-100 dark:hover:bg-slate-800"><MessageCircle size={19}/></Link><Link href="/notifications" aria-label="Notifications" className="rounded-full p-2.5 text-slate-800 hover:bg-blue-50 dark:text-slate-100 dark:hover:bg-slate-800"><Bell size={19}/></Link><Link href="/profile" aria-label="Profile" className="rounded-full p-2.5 text-slate-800 hover:bg-blue-50 dark:text-slate-100 dark:hover:bg-slate-800"><UserRound size={19}/></Link><ThemeToggle/></div></nav></header><AppTabs/><main>{children}</main><Toaster richColors position="top-center"/></body></html>}
