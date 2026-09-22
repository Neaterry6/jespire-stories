import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, UserRound } from 'lucide-react'
import AppTabs from '@/components/app-tabs'
const inter=Inter({subsets:['latin'],variable:'--font-inter'}); const playfair=Playfair_Display({subsets:['latin'],variable:'--font-playfair'})
export const metadata:Metadata={title:'Jespire — Stories that stay with you',description:'Read and share stories on Jespire.',icons:{icon:'/jespire-logo.svg'}}
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${inter.variable} ${playfair.variable}`}><header className="sticky top-0 z-40 border-b border-blue-100/70 bg-[#f8fbff]/95 backdrop-blur-xl"><nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Link href="/" aria-label="Jespire home" className="flex items-center"><Image src="/jespire-logo.svg" alt="Jespire" width={142} height={41} priority className="h-9 w-auto"/></Link><div className="flex items-center gap-2"><Link href="/notifications" aria-label="Notifications" className="rounded-full p-2 hover:bg-blue-50"><Bell size={19}/></Link><Link href="/profile" aria-label="Profile" className="rounded-full p-2 hover:bg-blue-50"><UserRound size={19}/></Link></div></nav></header><AppTabs/><main>{children}</main><Toaster richColors position="top-center"/></body></html>}
