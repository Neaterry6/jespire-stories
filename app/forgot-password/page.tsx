'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { resetPassword } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset email sent. Check your inbox.')
    } catch (e: any) {
      toast.error(e?.message || 'Could not send the reset email.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="paper relative w-full max-w-md rounded-[2rem] p-8 shadow-soft sm:p-10">
        <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-blue-600">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <div className="mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
          <Mail size={21} />
        </div>
        <p className="mt-7 text-xs uppercase tracking-[.25em] text-blue-600">Account recovery</p>
        <h1 className="mt-3 font-serif text-4xl">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-black/50">Enter your email and Firebase will send you a secure password reset link.</p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="font-medium text-blue-900">Check your inbox</p>
            <p className="mt-1 text-sm leading-6 text-blue-800/70">If an account uses that email, you’ll receive a reset message shortly.</p>
            <Link href="/auth" className="mt-4 inline-block font-medium text-blue-600 hover:underline">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-3">
            <label className="relative block">
              <Mail className="absolute left-4 top-3.5 text-black/35" size={18} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-50">
              {busy ? 'Sending…' : 'Send reset link'}
              {!busy && <Send size={17} />}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
