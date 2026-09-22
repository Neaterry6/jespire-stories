'use client'
import { FormEvent, useEffect, useState } from 'react'
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { getJespireRole } from '@/lib/roles'
import { AtSign, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Onboarding(){
 const {user,loading}=useAuth(); const router=useRouter(); const [username,setUsername]=useState(''); const [busy,setBusy]=useState(false)
 useEffect(()=>{if(loading)return;if(!user){router.replace('/auth');return}const role=getJespireRole(user.email);if(role!=='user'){router.replace('/feed');return}getDoc(doc(db,'users',user.uid)).then(s=>{const u=s.data()?.username;if(u)router.replace('/feed')})},[user,loading,router])
 async function submit(e:FormEvent){e.preventDefault();if(!user)return;const clean=username.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');if(clean.length<3)return toast.error('Use at least 3 letters or numbers.');setBusy(true);try{await runTransaction(db,async tx=>{const nameRef=doc(db,'usernames',clean);const existing=await tx.get(nameRef);if(existing.exists()&&existing.data()?.uid!==user.uid)throw new Error('That username is already taken.');tx.set(nameRef,{uid:user.uid,username:clean,createdAt:serverTimestamp()},{merge:false});tx.set(doc(db,'users',user.uid),{username:clean},{merge:true});tx.set(doc(db,'chatMembers',user.uid),{username:clean},{merge:true})});toast.success(`@${clean} is ready.`);router.replace('/feed')}catch(err:any){toast.error(err?.message||'Could not save username.')}finally{setBusy(false)}}
 return <main className="min-h-[calc(100vh-64px)] px-5 py-14"><section className="mx-auto max-w-lg rounded-[2rem] border border-blue-100 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:p-10"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><AtSign/></div><p className="mt-8 text-xs uppercase tracking-[.25em] text-blue-600">One last step</p><h1 className="mt-2 font-serif text-4xl text-slate-950 dark:text-white">Choose your Jespire username.</h1><p className="mt-3 text-sm leading-6 text-slate-500">This is how readers will know you in the community.</p><form onSubmit={submit} className="mt-7"><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Username<input autoFocus required value={username} onChange={e=>setUsername(e.target.value)} placeholder="yourname" className="field mt-2"/></label><p className="mt-2 text-xs text-slate-400">Letters, numbers and underscores. 3–24 characters.</p><button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white disabled:opacity-50">{busy?'Saving…':<>Continue to Jespire <ArrowRight size={17}/></>}</button></form><div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 size={15} className="text-blue-600"/> Your Google account stays connected.</div></section></main>
}
