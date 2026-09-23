import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined
let storageInstance: FirebaseStorage | undefined
let googleProviderInstance: GoogleAuthProvider | undefined

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client services must only be initialized in the browser.')
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error('Firebase configuration is missing. Add the NEXT_PUBLIC_FIREBASE_* variables to the Vercel environment used by this deployment.')
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return app
}

export function getFirebaseAuth() {
  return (authInstance ??= getAuth(getFirebaseApp()))
}

export function getFirebaseDb() {
  return (dbInstance ??= getFirestore(getFirebaseApp()))
}

export function getFirebaseStorage() {
  return (storageInstance ??= getStorage(getFirebaseApp()))
}

export function getGoogleProvider() {
  return (googleProviderInstance ??= new GoogleAuthProvider())
}

// Client-only compatibility exports. The getters above are the preferred API,
// while these keep existing client components working without server prerender initialization.
export const auth = undefined as unknown as Auth
export const db = undefined as unknown as Firestore
export const storage = undefined as unknown as FirebaseStorage
export const googleProvider = undefined as unknown as GoogleAuthProvider
