'use client'
import Link from 'next/link'
import { BookOpen, MessageCircle, UserRound } from 'lucide-react'
import { usePathname } from 'next/navigation'

const tabs=[{href:'/feed',label:'Feed',icon:BookOpen},{href:'/community',label:'Community',icon:MessageCircle},{href:'/profile',label:'Profile',icon:UserRound}]
export default function AppTabs(){const path=usePathname();return <div className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-5 py-3"><div className="flex rounded-full border border-blue-100 bg-white/80 p-1 shadow-sm backdrop-blur">{tabs.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${path.startsWith(href)?'bg-blue-600 text-white shadow-sm':'text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}><Icon size={16}/><span>{label}</span></Link>)}</div></div>}
