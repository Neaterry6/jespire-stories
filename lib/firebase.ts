import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Auth, Firestore and Storage are browser-side services in this app.
// Defer Firebase initialization until the browser so Next.js can prerender
// pages on Vercel without trying to initialize Firebase with an unavailable
// build-time client key.
let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null
let googleProviderInstance: GoogleAuthProvider | null = null

if (typeof window !== 'undefined') {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const

  const missing = requiredKeys.filter((key) => !process.env[key])

  if (missing.length) {
    throw new Error(
      `Firebase configuration is missing from the Vercel client environment: ${missing.join(', ')}`
    )
  }

  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  authInstance = getAuth(app)
  dbInstance = getFirestore(app)
  storageInstance = getStorage(app)
  googleProviderInstance = new GoogleAuthProvider()
}

// The module is imported by client components only. The assertions keep the
// existing Firebase API/types intact while the actual initialization remains
// browser-only.
export const auth = authInstance as Auth
export const db = dbInstance as Firestore
export const storage = storageInstance as FirebaseStorage
export const googleProvider = googleProviderInstance as GoogleAuthProvider
