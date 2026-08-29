/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   FIREBASE PROJECT CONFIG — paste your config from the
   Firebase console here ONCE. Both firebase-sync.js (site
   content/live sync) and chat-sync.js (customer messages)
   import it from this one file.
   ========================================================= */
export const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

export const ADMIN_EMAIL_FOR_RULES = 'farhanalipervez@gmail.com';

export function isFirebaseConfigured() {
    return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_');
}

// A single, reliable flag any page/module can check synchronously via
// window — set once, the first time this file is imported by any of
// firebase-sync.js / chat-sync.js / account-sync.js (whichever loads
// first), so the UI can tell "not configured yet" apart from "configured
// but something failed to start" (a real bug worth showing in console).
window.isFirebaseConfiguredGlobal = isFirebaseConfigured();
