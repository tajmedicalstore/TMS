/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   FIREBASE SETUP (optional — makes admin edits go live for
   every visitor instead of just this browser/device). Steps:

   1. Go to https://console.firebase.google.com → Create a
      project (free "Spark" plan is enough).
   2. Build → Firestore Database → Create database
      (start in "test mode" for now, lock down with rules below).
   3. Build → Authentication → Sign-in method → enable
      "Email/Password". Then Authentication → Users → Add user
      with EXACTLY this email/password so admin.html can also
      authenticate to Firestore:
        Email:    farhanalipervez@gmail.com
        Password: TMS@786
   4. Project settings (gear icon) → General → "Your apps" →
      Web app (</>) → copy the firebaseConfig object it gives
      you and paste it into FIREBASE_CONFIG below.
   5. Firestore → Rules tab → paste this, then Publish:
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /siteData/main {
              allow read: if true;
              allow write: if request.auth != null;
            }
          }
        }
   6. Re-upload this file to GitHub (same folder as index.html
      and admin.html). Reload the site — the "Sync Status" box in
      admin.html → Site Settings will confirm it's connected.

   Until you complete this, both pages keep working exactly as
   they do now (localStorage only, per device/browser).

   This ONE file is shared by both index.html and admin.html, so
   the config only needs to be entered once, here.
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const isConfigured = FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_');
window.firebaseReady = false;

if (isConfigured) {
    try {
        const app = initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const siteDocRef = doc(db, 'siteData', 'main');

        window.firebaseReady = true;

        // Live sync: any admin save anywhere reflects here instantly,
        // on both index.html (visitors) and admin.html (other sessions).
        onSnapshot(siteDocRef, (snap) => {
            if (snap.exists() && typeof mergeSiteData === 'function') {
                window.currentSiteData = mergeSiteData(snap.data());
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('tms_site_data_v1', JSON.stringify(window.currentSiteData));
                }
                if (typeof window.onSiteDataUpdated === 'function') window.onSiteDataUpdated();
            }
        }, (err) => console.error('Firestore listen error:', err));

        // Only admin.html actually calls this (visitors never write).
        window.pushSiteDataToFirestore = function (data) {
            setDoc(siteDocRef, data, { merge: false }).catch(err => {
                console.error('Firestore save failed (are you signed in + rules published?):', err);
            });
        };

        window.firebaseAdminSignIn = function (email, password) {
            signInWithEmailAndPassword(auth, email, password).catch(err => {
                console.warn('Firebase Auth sign-in failed — admin panel still works locally, but writes will only sync once this succeeds. Check that this user exists in Firebase Authentication.', err);
            });
        };

        window.firebaseAdminSignOut = function () {
            signOut(auth).catch(() => {});
        };
    } catch (e) {
        console.error('Firebase init failed:', e);
    }
} else {
    console.info('Firebase not configured yet — running in local-only mode. See the FIREBASE SETUP comment at the top of this file for steps.');
}
