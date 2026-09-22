'use client'
import { FormEvent, useState } from 'react'
import { signInGoogle, signInEmail, signUpEmail } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, UserRound, ArrowRight } from 'lucide-react'

export default function Auth() {
  const [signup, setSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      if (signup) await signUpEmail(name, email, password)
      else await signInEmail(email, password)
      toast.success(signup ? 'Account created. Check your email to verify it.' : 'Welcome back.')
      router.push('/feed')
    } catch (e: any) {
      const code = e?.code || ''
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/weak-password': 'Choose a password with at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.'
      }
      toast.error(messages[code] || e?.message || 'Authentication failed.')
    } finally { setBusy(false) }
  }

  async function google() {
    setBusy(true)
    try { await signInGoogle(); toast.success('Welcome to Jespire.'); router.push('/feed') }
    catch (e: any) { toast.error(e?.message || 'Google sign-in failed.') }
    finally { setBusy(false) }
  }

  return <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-5 py-16">
    <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
    <div className="paper relative w-full max-w-md rounded-[2rem] p-8 shadow-soft sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"><span className="font-serif text-xl">J</span></div>
        <div><p className="font-serif text-xl">Jespire</p><p className="text-xs text-black/40">Stories that stay with you.</p></div>
      </div>
      <p className="text-xs uppercase tracking-[.25em] text-blue-600">{signup ? 'Create account' : 'Welcome back'}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{signup ? 'Create your reading room.' : 'Come back to the page.'}</h1>
      <p className="mt-2 text-sm leading-6 text-black/50">{signup ? 'Save stories, join the community, and keep your reading history.' : 'Sign in with your email or continue with Google.'}</p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {signup && <label className="relative block"><UserRound className="absolute left-4 top-3.5 text-black/35" size={18}/><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>}
        <label className="relative block"><Mail className="absolute left-4 top-3.5 text-black/35" size={18}/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
        <label className="relative block"><Lock className="absolute left-4 top-3.5 text-black/35" size={18}/><input required minLength={6} type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-2.5 rounded-xl p-2 text-black/40 hover:bg-black/5" aria-label="Toggle password visibility">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></label>
        {!signup && <div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</Link></div>}
        <button disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50">{busy?'Please wait…':signup?'Create account':'Sign in'}{!busy&&<ArrowRight size={17} className="transition group-hover:translate-x-1"/>}</button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-black/30"><span className="h-px flex-1 bg-black/10"/>OR<span className="h-px flex-1 bg-black/10"/></div>
      <button disabled={busy} onClick={google} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white py-3.5 font-medium transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold shadow-sm">G</span> Continue with Google</button>
      <button onClick={()=>setSignup(!signup)} className="mt-6 w-full text-sm text-black/55 hover:text-blue-600">{signup?'Already have an account? Sign in':'New here? Create an account'}</button>
    </div>
  </main>
}
