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

function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client services cannot be used during server rendering.')
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error('Firebase configuration is missing. Add the NEXT_PUBLIC_FIREBASE_* variables to the Vercel Preview/Production environment.')
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return app
}

export function getFirebaseAuth(): Auth {
  return (authInstance ??= getAuth(getFirebaseApp()))
}

export function getFirebaseDb(): Firestore {
  return (dbInstance ??= getFirestore(getFirebaseApp()))
}

export function getFirebaseStorage(): FirebaseStorage {
  return (storageInstance ??= getStorage(getFirebaseApp()))
}

export function getGoogleProvider(): GoogleAuthProvider {
  return (googleProviderInstance ??= new GoogleAuthProvider())
}

function lazyService<T extends object>(getService: () => T): T {
  return new Proxy({} as T, {
    get(_target, property, receiver) {
      return Reflect.get(getService(), property, receiver)
    },
    has(_target, property) {
      return Reflect.has(getService(), property)
    },
    ownKeys() {
      return Reflect.ownKeys(getService())
    },
    getOwnPropertyDescriptor(_target, property) {
      const descriptor = Reflect.getOwnPropertyDescriptor(getService(), property)
      return descriptor || { configurable: true, enumerable: true }
    },
  })
}

// Firebase is intentionally lazy here. Next.js prerenders client components on the
// server, where NEXT_PUBLIC_* values may not be available and Firebase must not initialize.
// Existing imports can continue using auth/db/storage without changing every page.
export const auth = lazyService(getFirebaseAuth)
export const db = lazyService(getFirebaseDb)
export const storage = lazyService(getFirebaseStorage)
export const googleProvider = lazyService(getGoogleProvider)
