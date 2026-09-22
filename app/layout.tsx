import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { Bell, MessageCircle, UserRound } from 'lucide-react'
const inter=Inter({subsets:['latin'],variable:'--font-inter'}); const playfair=Playfair_Display({subsets:['latin'],variable:'--font-playfair'})
export const metadata:Metadata={title:'Jespire — Stories that stay with you',description:'A soft, intimate home for stories by Jespire.'}
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${inter.variable} ${playfair.variable}`}><header className="sticky top-0 z-40 border-b border-blue-100/70 bg-[#f8fbff]/90 backdrop-blur-xl"><nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Link href="/" className="font-serif text-2xl tracking-tight">JESPIRE<span className="text-blue-600">.</span></Link><div className="flex items-center gap-5 text-sm"><Link href="/feed" className="hidden sm:block">Stories</Link><Link href="/community" aria-label="Community"><MessageCircle size={19}/></Link><Link href="/notifications" aria-label="Notifications"><Bell size={19}/></Link><Link href="/profile" aria-label="Profile"><UserRound size={19}/></Link></div></nav></header><main>{children}</main><Toaster richColors position="top-center"/></body></html>}
