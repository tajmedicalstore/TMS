/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   FIREBASE SETUP (optional — makes admin edits go live for
   every visitor instead of just this browser/device, and
   powers the customer chat in chat-sync.js). Steps:

   1. Go to https://console.firebase.google.com → Create a
      project (free "Spark" plan is enough).
   2. Build → Firestore Database → Create database
      (start in "test mode" for now, lock down with rules below).
   3. Build → Authentication → Sign-in method → enable
      "Email/Password" AND "Anonymous" (Anonymous powers the
      customer chat — each visitor gets a private identity
      without needing to make an account) AND "Google" (for the
      "Continue with Google" sign-in button — customer accounts).
      Then Authentication → Users → Add user with EXACTLY this
      email/password so admin.html can also authenticate:
        Email:    farhanalipervez@gmail.com
        Password: TMS@786
   4. Project settings (gear icon) → General → "Your apps" →
      Web app (</>) → copy the firebaseConfig object it gives
      you and paste it into firebase-config.js (NOT this file —
      there's only one config file now, shared by this script,
      chat-sync.js, and account-sync.js).
   5. Firestore → Rules tab → paste this, then Publish:
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /siteData/main {
              allow read: if true;
              allow write: if request.auth != null;
            }
            match /conversations/{visitorId} {
              allow read, write: if request.auth != null &&
                (request.auth.uid == visitorId || request.auth.token.email == 'farhanalipervez@gmail.com');
              match /messages/{messageId} {
                allow read, write: if request.auth != null &&
                  (request.auth.uid == visitorId || request.auth.token.email == 'farhanalipervez@gmail.com');
              }
            }
            match /users/{uid} {
              allow read: if request.auth != null &&
                (request.auth.uid == uid || request.auth.token.email == 'farhanalipervez@gmail.com');
              allow create: if request.auth != null && request.auth.uid == uid &&
                (request.resource.data.role == 'customer' || request.auth.token.email == 'farhanalipervez@gmail.com');
              allow update: if request.auth != null && (
                (request.auth.uid == uid && request.resource.data.role == resource.data.role) ||
                request.auth.token.email == 'farhanalipervez@gmail.com'
              );
            }
            match /securityLog/{entryId} {
              allow read: if request.auth != null && request.auth.token.email == 'farhanalipervez@gmail.com';
              allow create: if request.auth != null && request.auth.token.email == 'farhanalipervez@gmail.com';
            }
          }
        }
   6. Re-upload firebase-config.js to GitHub with your real
      config (same folder as index.html and admin.html). Reload
      the site — the "Sync Status" box in admin.html → Site
      Settings will confirm it's connected.

   Until you complete this, both pages keep working exactly as
   they do now (localStorage only, per device/browser) and the
   chat button won't be able to send messages.
   ========================================================= */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { FIREBASE_CONFIG, isFirebaseConfigured } from "./firebase-config.js";

window.firebaseReady = false;

if (isFirebaseConfigured()) {
    try {
        const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const siteDocRef = doc(db, 'siteData', 'main');

        window.firebaseReady = true;
        window.firebaseApp = app;
        window.firebaseDb = db;
        window.firebaseAuthInstance = auth;

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
            return signInWithEmailAndPassword(auth, email, password).catch(err => {
                console.warn('Firebase Auth sign-in failed — admin panel still works locally, but writes will only sync once this succeeds. Check that this user exists in Firebase Authentication.', err);
            });
        };

        window.firebaseAdminSignOut = function () {
            signOut(auth).catch(() => {});
        };

        // Cross-device security log — visible in admin.html → Security even
        // if the login happened on a different phone/laptop. Only successful
        // logins are logged here (an unauthenticated failed attempt has no
        // session to write with — those stay in that device's local log).
        window.logSecurityEvent = function (eventType) {
            if (!auth.currentUser) return;
            addDoc(collection(db, 'securityLog'), {
                type: eventType,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent
            }).catch((err) => console.warn('Security log write failed:', err));
        };

        window.listenSecurityLog = function (callback) {
            const q = query(collection(db, 'securityLog'), orderBy('timestamp', 'desc'), limit(30));
            return onSnapshot(q, (snap) => {
                callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }, (err) => console.warn('Security log read failed:', err));
        };

        if (typeof window.onFirebaseReady === 'function') window.onFirebaseReady();
    } catch (e) {
        console.error('Firebase init failed:', e);
        window.firebaseInitError = e;
    }
} else {
    console.info('Firebase not configured yet — running in local-only mode. See the FIREBASE SETUP comment at the top of this file for steps.');
}
