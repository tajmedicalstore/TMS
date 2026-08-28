/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   CUSTOMER ACCOUNTS — manual sign-up (email/password) and
   Google sign-in, with a profile stored in Firestore that the
   admin can view/edit from admin.html → Accounts.

   Needs the SAME Firebase project as chat-sync.js, with
   Email/Password AND Google enabled under Authentication →
   Sign-in method (see the setup comment in firebase-sync.js).

   Role tags: every profile has a "role" — 'customer' by default.
   The one email in ADMIN_EMAIL_FOR_RULES (firebase-config.js)
   always shows as 'admin' automatically. Any other role (manager,
   owner, director, developer) is assigned by the admin from
   admin.html → Accounts, and shows next to that person's name
   once THEY sign in on the front-end.
   ========================================================= */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
    GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { FIREBASE_CONFIG, isFirebaseConfigured, ADMIN_EMAIL_FOR_RULES } from "./firebase-config.js";

window.accountReady = false;

if (isFirebaseConfigured()) {
    try {
        const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const auth = getAuth(app);

        window.accountReady = true;

        async function ensureProfile(user, extra) {
            const ref = doc(db, 'users', user.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                await setDoc(ref, {
                    name: (extra && extra.name) || user.displayName || 'Customer',
                    email: user.email || '',
                    provider: (extra && extra.provider) || 'password',
                    role: user.email === ADMIN_EMAIL_FOR_RULES ? 'admin' : 'customer',
                    createdAt: serverTimestamp()
                });
            }
            return (await getDoc(ref)).data();
        }

        window.accountSignUp = function (name, email, password) {
            return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
                await updateProfile(cred.user, { displayName: name });
                await ensureProfile(cred.user, { name, provider: 'password' });
                return cred.user;
            });
        };

        window.accountSignIn = function (email, password) {
            return signInWithEmailAndPassword(auth, email, password);
        };

        window.accountGoogleSignIn = function () {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(auth, provider).then(async (cred) => {
                await ensureProfile(cred.user, { name: cred.user.displayName, provider: 'google' });
                return cred.user;
            });
        };

        window.accountSignOut = function () {
            return signOut(auth);
        };

        // Fires with (null) when logged out, or ({uid, name, email, role, provider}) when logged in.
        window.accountListenAuthState = function (callback) {
            return onAuthStateChanged(auth, async (user) => {
                if (!user || user.isAnonymous) { callback(null); return; }
                try {
                    const profile = await ensureProfile(user, {});
                    callback({ uid: user.uid, ...profile });
                } catch (e) {
                    console.error('Could not load account profile:', e);
                    callback(null);
                }
            });
        };

        window.accountUpdateProfile = function (uid, data) {
            return updateDoc(doc(db, 'users', uid), data);
        };

        // Admin only (Firestore rules restrict this to the admin email).
        window.accountListenAllUsers = function (callback) {
            return onSnapshot(collection(db, 'users'), (snap) => {
                callback(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
            }, (err) => console.error('Accounts listen error:', err));
        };

        window.accountSetRole = function (uid, role) {
            return updateDoc(doc(db, 'users', uid), { role });
        };

        if (typeof window.onAccountReady === 'function') window.onAccountReady();
    } catch (e) {
        console.error('Account system init failed:', e);
    }
} else {
    console.info('Accounts not connected yet — Firebase isn\'t configured. See the FIREBASE SETUP comment in firebase-sync.js.');
}
