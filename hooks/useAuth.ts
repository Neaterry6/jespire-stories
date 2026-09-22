'use client'
import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'

const OWNER_EMAILS = ['akewusholaabdulbakri101@gmail.com', 'jennypandy49@gmail.com']
const isOwner = (email?: string | null) => OWNER_EMAILS.includes((email || '').trim().toLowerCase())

const syncUser = async (user: User) => {
  const owner = isOwner(user.email)
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  const base = { email: user.email || '', displayName: user.displayName || 'Reader', photoURL: user.photoURL || '', joinedAt: serverTimestamp(), bookmarkedIds: [] }
  if (!snap.exists()) {
    await setDoc(ref, { ...base, role: owner ? 'owner' : 'user' })
    await setDoc(doc(db, 'chatMembers', user.uid), { joinedAt: serverTimestamp() })
  } else if (owner && snap.data().role !== 'owner') {
    await setDoc(ref, { role: 'owner' }, { merge: true })
  }
  return user
}

export const OWNER_EMAILS_LIST = OWNER_EMAILS
export const isOwnerEmail = isOwner

export async function signInGoogle() { return syncUser((await signInWithPopup(auth, googleProvider)).user) }
export async function signInEmail(email: string, password: string) { return syncUser((await signInWithEmailAndPassword(auth, email.trim(), password)).user) }
export async function signUpEmail(name: string, email: string, password: string) {
  const user = (await createUserWithEmailAndPassword(auth, email.trim(), password)).user
  await updateProfile(user, { displayName: name.trim() || 'Reader' })
  await sendEmailVerification(user)
  return syncUser(user)
}
export async function resetPassword(email: string) {
  const actionCodeSettings = typeof window !== 'undefined' ? { url: `${window.location.origin}/auth`, handleCodeInApp: false } : undefined
  return sendPasswordResetEmail(auth, email.trim(), actionCodeSettings)
}
export async function resendVerification() { if (!auth.currentUser) throw new Error('Please sign in first.'); return sendEmailVerification(auth.currentUser) }
export const logout = () => signOut(auth)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false) }), [])
  return { user, loading }
}
