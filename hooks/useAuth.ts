'use client'
import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'
import { getJespireRole, isStaffEmail } from '@/lib/roles'

const FIXED_USERNAMES: Record<string,string> = {
  'akewusholaabdulbakri101@gmail.com': 'brokenvzn',
  'jennypandy49@gmail.com': 'jespirepen',
}

export const getFixedUsername = (email?: string | null) => FIXED_USERNAMES[(email || '').trim().toLowerCase()] || ''

const syncUser = async (user: User) => {
  const email = (user.email || '').trim().toLowerCase()
  const role = getJespireRole(email)
  const fixedUsername = getFixedUsername(email)
  const ref = doc(db, 'users', user.uid)

  await setDoc(ref, {
    email: user.email || '',
    displayName: user.displayName || 'Reader',
    photoURL: user.photoURL || '',
    role,
    ...(fixedUsername ? { username: fixedUsername } : {}),
    lastLoginAt: serverTimestamp(),
    ...(role === 'user' ? { joinedAt: serverTimestamp() } : {}),
  }, { merge: true })

  await setDoc(doc(db, 'chatMembers', user.uid), {
    email: user.email || '', displayName: user.displayName || 'Reader', photoURL: user.photoURL || '', role,
    ...(fixedUsername ? { username: fixedUsername } : {}), lastSeenAt: serverTimestamp(),
  }, { merge: true })
  return user
}

export const OWNER_EMAILS_LIST = ['akewusholaabdulbakri101@gmail.com','jennypandy49@gmail.com']
export const isOwnerEmail = isStaffEmail
export { getJespireRole }

export async function signInGoogle() { return syncUser((await signInWithPopup(auth, googleProvider)).user) }
export async function signInEmail(email: string, password: string) { return syncUser((await signInWithEmailAndPassword(auth, email.trim(), password)).user) }
export async function signUpEmail(name: string, email: string, password: string) { const user=(await createUserWithEmailAndPassword(auth,email.trim(),password)).user; await updateProfile(user,{displayName:name.trim()||'Reader'}); await sendEmailVerification(user); return syncUser(user) }
export async function resetPassword(email: string) { const actionCodeSettings=typeof window!=='undefined'?{url:`${window.location.origin}/auth`,handleCodeInApp:false}:undefined; return sendPasswordResetEmail(auth,email.trim(),actionCodeSettings) }
export async function resendVerification() { if(!auth.currentUser) throw new Error('Please sign in first.'); return sendEmailVerification(auth.currentUser) }
export const logout=()=>signOut(auth)

export function useAuth(){
  const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true)
  useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}),[])
  return {user,loading}
}
