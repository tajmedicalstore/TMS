/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   CUSTOMER CHAT — real-time messaging between a visitor and
   the admin. Each visitor gets a private, anonymous Firebase
   identity (no signup needed); Firestore security rules (see
   firebase-sync.js) make sure only that visitor and the admin
   account can ever read their conversation — never another
   customer.

   Needs the same Firebase project as firebase-sync.js, with
   Anonymous sign-in enabled (see the setup comment there).
   Until that's done, the chat button still opens but shows a
   "not connected yet" notice instead of failing silently.
   ========================================================= */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, writeBatch,
    onSnapshot, query, orderBy, serverTimestamp, enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { FIREBASE_CONFIG, isFirebaseConfigured, ADMIN_EMAIL_FOR_RULES } from "./firebase-config.js";

window.chatReady = false;

if (isFirebaseConfigured()) {
    try {
        const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const auth = getAuth(app);

        try { enableIndexedDbPersistence(db); } catch (e) { /* multiple tabs open, or unsupported — ignore, still works online */ }

        window.chatReady = true;

        /* ---- Customer side: anonymous identity ---- */
        window.chatSignInVisitor = function (callback) {
            onAuthStateChanged(auth, (user) => {
                if (user) { callback(user.uid); return; }
                signInAnonymously(auth).catch(err => console.error('Anonymous sign-in failed:', err));
            });
        };

        window.chatSetVisitorProfile = function (visitorId, name, contact) {
            const ref = doc(db, 'conversations', visitorId);
            setDoc(ref, { name: name || 'Guest', contact: contact || '', updatedAt: serverTimestamp() }, { merge: true });
        };

        window.chatSendMessage = function (visitorId, sender, text, imageBase64) {
            const msgRef = collection(db, 'conversations', visitorId, 'messages');
            const convRef = doc(db, 'conversations', visitorId);
            const preview = text ? text.slice(0, 60) : (imageBase64 ? '📷 Photo' : '');
            return Promise.all([
                addDoc(msgRef, { sender, text: text || '', image: imageBase64 || null, timestamp: serverTimestamp() }),
                setDoc(convRef, {
                    lastMessage: preview,
                    lastMessageTime: serverTimestamp(),
                    unreadByAdmin: sender === 'customer' ? true : false,
                    unreadByCustomer: sender === 'admin' ? true : false
                }, { merge: true })
            ]).catch(err => {
                console.error('Chat send failed:', err);
                throw err;
            });
        };

        window.chatListenToThread = function (visitorId, callback, onError) {
            const q = query(collection(db, 'conversations', visitorId, 'messages'), orderBy('timestamp', 'asc'));
            return onSnapshot(q, (snap) => {
                const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(messages);
            }, (err) => {
                console.error('Chat thread listen error:', err);
                if (typeof onError === 'function') onError(err);
            });
        };

        window.chatMarkRead = function (visitorId, byAdmin) {
            const ref = doc(db, 'conversations', visitorId);
            updateDoc(ref, byAdmin ? { unreadByAdmin: false } : { unreadByCustomer: false }).catch(() => {});
        };

        /* ---- Admin side: inbox of every conversation ---- */
        window.chatListenToAllConversations = function (callback, onError) {
            const q = query(collection(db, 'conversations'), orderBy('lastMessageTime', 'desc'));
            return onSnapshot(q, (snap) => {
                const conversations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(conversations);
            }, (err) => {
                console.error('Chat inbox listen error:', err);
                if (typeof onError === 'function') onError(err);
            });
        };

        window.chatAdminSignedIn = function () {
            return auth.currentUser && auth.currentUser.email === ADMIN_EMAIL_FOR_RULES;
        };

        // Sends one message to every EXISTING conversation at once — reaches
        // customers who have already messaged at least once. New visitors who
        // start a chat after a broadcast won't see past broadcasts (there's no
        // customer directory beyond people who've opened a conversation).
        window.chatSendBroadcast = async function (text, imageBase64) {
            const snap = await getDocs(collection(db, 'conversations'));
            const batch = writeBatch(db);
            const preview = '📢 ' + (text ? text.slice(0, 55) : 'Photo announcement');
            snap.forEach((convDoc) => {
                const msgRef = doc(collection(db, 'conversations', convDoc.id, 'messages'));
                batch.set(msgRef, {
                    sender: 'admin', text: text || '', image: imageBase64 || null,
                    isBroadcast: true, timestamp: serverTimestamp()
                });
                batch.set(doc(db, 'conversations', convDoc.id), {
                    lastMessage: preview, lastMessageTime: serverTimestamp(), unreadByCustomer: true
                }, { merge: true });
            });
            await batch.commit();
            return snap.size;
        };

        if (typeof window.onChatReady === 'function') window.onChatReady();
    } catch (e) {
        console.error('Chat init failed:', e);
        window.chatInitError = e;
    }
} else {
    console.info('Chat not connected yet — Firebase isn\'t configured. See the FIREBASE SETUP comment in firebase-sync.js.');
}
