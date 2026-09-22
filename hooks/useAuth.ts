'use client'
import { useEffect, useState } from 'react'
import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'

const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)
const syncUser = async (user: User) => {
 const role = admins.includes((user.email || '').toLowerCase()) ? 'admin' : 'user'
 const ref = doc(db,'users',user.uid); const snap = await getDoc(ref)
 if (!snap.exists()) { await setDoc(ref,{email:user.email||'',displayName:user.displayName||'Reader',photoURL:user.photoURL||'',role,joinedAt:serverTimestamp(),bookmarkedIds:[]}); await setDoc(doc(db,'chatMembers',user.uid),{joinedAt:serverTimestamp()}) }
 else if (role === 'admin' && snap.data().role !== 'admin') await setDoc(ref,{role},{merge:true})
 return user
}
export async function signInGoogle(){ return syncUser((await signInWithPopup(auth,googleProvider)).user) }
export async function signInEmail(email:string,password:string){ return syncUser((await signInWithEmailAndPassword(auth,email,password)).user) }
export async function signUpEmail(name:string,email:string,password:string){ const user=(await createUserWithEmailAndPassword(auth,email,password)).user; await updateProfile(user,{displayName:name}); return syncUser(user) }
export const logout=()=>signOut(auth)
export function useAuth(){ const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true); useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}),[]); return {user,loading} }
