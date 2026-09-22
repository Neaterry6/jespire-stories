# JESPIRE Stories

A soft, modern writer platform built with Next.js 14, Firebase Auth, Firestore, Storage, TailwindCSS, Framer Motion and Sonner.

## Setup
1. Copy `.env.example` to `.env.local`.
2. Enable Email/Password and Google providers in Firebase Authentication.
3. Enable Firestore and Storage.
4. Apply `firestore.rules` and `storage.rules` with Firebase CLI.
5. Run `npm install && npm run dev`.

Admin access is restricted in Firebase rules to the two configured admin emails. The client also syncs the admin role into each admin user's `users/{uid}` document.

Never commit `.env.local` or private server credentials.