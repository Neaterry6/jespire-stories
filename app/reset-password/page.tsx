'use client'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'sonner'
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [code, setCode] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [validating, setValidating] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oobCode = params.get('oobCode')
    setCode(oobCode)
    if (!oobCode) { setValidating(false); return }
    verifyPasswordResetCode(auth, oobCode).then(setEmail).catch(() => toast.error('This reset link is invalid or expired.')).finally(() => setValidating(false))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!code) return
    if (password !== confirm) { toast.error('Passwords do not match.'); return }
    if (password.length < 6) { toast.error('Use at least 6 characters.'); return }
    setBusy(true)
    try { await confirmPasswordReset(auth, code, password); setDone(true); toast.success('Password updated successfully.') }
    catch (e: any) { toast.error(e?.message || 'Could not reset your password.') }
    finally { setBusy(false) }
  }

  return <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-5 py-16"><div className="pointer-events-none absolute h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"/><div className="paper relative w-full max-w-md rounded-[2rem] p-8 shadow-soft sm:p-10"><Link href="/auth" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-blue-600"><ArrowLeft size={16}/> Back to sign in</Link>{validating?<div className="mt-12 space-y-4"><div className="h-8 w-2/3 animate-pulse rounded bg-blue-100"/><div className="h-12 animate-pulse rounded-2xl bg-blue-50"/><div className="h-12 animate-pulse rounded-2xl bg-blue-50"/></div>:done?<div className="py-12 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-blue-600"><CheckCircle2/></div><h1 className="mt-5 font-serif text-4xl">You’re all set.</h1><p className="mt-3 text-sm leading-6 text-black/50">Your Jespire password has been changed.</p><Link href="/auth" className="mt-7 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white">Sign in</Link></div>:!code||!email?<div className="py-12 text-center"><h1 className="font-serif text-4xl">Link unavailable.</h1><p className="mt-3 text-sm leading-6 text-black/50">This password reset link is invalid or expired. Request a new one and try again.</p><Link href="/forgot-password" className="mt-7 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white">Request new link</Link></div>:<><div className="mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><Lock size={21}/></div><p className="mt-7 text-xs uppercase tracking-[.25em] text-blue-600">New password</p><h1 className="mt-3 font-serif text-4xl">Choose a new password.</h1><p className="mt-2 text-sm text-black/50">Resetting access for {email}</p><form onSubmit={submit} className="mt-8 space-y-3"><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><input required minLength={6} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><button disabled={busy} className="w-full rounded-2xl bg-blue-600 py-3.5 font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-50">{busy?'Updating…':'Update password'}</button></form></>}</div></main>
