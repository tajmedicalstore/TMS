/*
 * Taj Medical Store — Website & Admin System
 * Made By Farhan (Farhan Ali) — All Rights Reserved.
 * Contact: tajmedicalstoreofficial@gmail.com
 */

/* =========================================================
   TAJ MEDICAL STORE — SHARED SITE DATA LAYER
   Used by BOTH index.html (public site) and admin.html (admin
   panel). Keeps product/content data, defaults, and local-storage
   persistence in one place so both pages always agree on the
   schema. Loaded before firebase-sync.js and the page's own inline
   script in both files.
   ========================================================= */

        const EXTERNAL_STORE_URL_FALLBACK = 'https://taj-medical-store.netlify.app';
        const SITE_DATA_KEY = 'tms_site_data_v1';

        const DEFAULT_SITE_DATA = {
            hero: {
                badge: "TMS | Chak 99 GB Nehang Badala",
                title1: "Your Health is",
                title2: "Our Sole Mission.",
                desc: "Providing 100% genuine medical supplies, baby care, surgical items, and general groceries under the expert supervision of Muhammad Pervaiz."
            },
            categories: [
                { id: 'cat_1', title: 'Pharmacy & Meds', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&fm=webp' },
                { id: 'cat_2', title: 'Baby Care & Feed', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65ee9?q=80&w=600&fm=webp' },
                { id: 'cat_3', title: 'Skin & Cosmetics', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&fm=webp' },
                { id: 'cat_4', title: 'Surgical Items', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&fm=webp' }
            ],
            stock: [
                { id: 'stk_1', name: "Panadol (Paracetamol) 500mg", stock: true, price: 35, desc: "Fever & Pain Relief", category: 'Pharmacy & Meds', image: '', details: '' },
                { id: 'stk_2', name: "Augmentin 625mg", stock: true, price: 250, desc: "Antibiotic (Prescription Required)", category: 'Pharmacy & Meds', image: '', details: '' },
                { id: 'stk_3', name: "Insulin Mixtard 30 HM", stock: true, price: 950, desc: "Cold Chain Verified / Pharmacy", category: 'Pharmacy & Meds', image: '', details: '' },
                { id: 'stk_4', name: "Pampers Active Baby Size 4", stock: true, price: 1200, desc: "Baby Care", category: 'Baby Care & Feed', image: '', details: '' },
                { id: 'stk_5', name: "Surgical Spirit 100ml", stock: false, price: 100, desc: "First Aid Item / Surgical", category: 'Surgical Items', image: '', details: '' },
                { id: 'stk_6', name: "Johnson's Baby Powder", stock: true, price: 450, desc: "Baby Care", category: 'Baby Care & Feed', image: '', details: '' },
                { id: 'stk_7', name: "Sunblock SPF 50", stock: true, price: 800, desc: "Skin Care & Cosmetics", category: 'Skin & Cosmetics', image: '', details: '' }
            ],
            popup: { enabled: false, style: 'standard', title: '', message: '', image: '', code: '', ribbon: 'PUBLIC ALERT', buttonText: 'Shop Now', buttonLink: EXTERNAL_STORE_URL_FALLBACK },
            ads: [],
            adsSettings: { enabled: false, intervalMs: 4000 },
            gallery: [
                { id: 'gal_1', title: 'Store Front', category: 'Store', image: 'image1.png' },
                { id: 'gal_2', title: 'Pharmacy Counter', category: 'Store', image: 'image2.png' },
                { id: 'gal_3', title: 'Baby Care Aisle', category: 'Store', image: 'image3.png' },
                { id: 'gal_4', title: 'Surgical Section', category: 'Store', image: 'image4.png' },
                { id: 'gal_5', title: 'Cold Chain Storage', category: 'Store', image: 'image5.png' },
                { id: 'gal_6', title: 'Cosmetics Shelf', category: 'Store', image: 'image6.png' },
                { id: 'gal_7', title: 'Customer Service', category: 'Store', image: 'image7.png' }
            ],
            maintenance: { enabled: false, message: "We're currently performing scheduled maintenance. We'll be back online shortly — thank you for your patience!" },
            notifications: [],
            newsBannerSettings: { enabled: false, intervalMs: 5000 },
            customLinks: [],
            customPages: [],
            sidebarOverrides: {},
            contact: {
                phone: '03437769660',
                phone2: '03167328419',
                whatsapp: '923437769660',
                email: 'tajmedicalstoreofficial@gmail.com',
                address: 'Chak 99 GB Nehang, Badala, Jaranwala.',
                facebook: 'https://facebook.com/m.parvaiz.10690',
                instagram: 'https://instagram.com/m.pervaiz.99'
            },
            footerDesc: 'Setting the standard for quality healthcare, genuine medicines, and community service in Jaranwala.',
            marqueeText: "⚠️ DISCLAIMER: No Home Delivery is available. • Original Doctor's Prescription is mandatory for Antibiotics & Sedatives. • Strict Cold Chain is maintained for your safety. • Government approved retail rates applied.",
            events: [],
            branding: { activeLogo: 'logo.png', appName: 'Taj Medical Store', appShortName: 'Taj Medical' }
        };

        function mergeSiteData(parsed) {
            if (!parsed) return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
            return {
                hero: { ...DEFAULT_SITE_DATA.hero, ...(parsed.hero || {}) },
                categories: parsed.categories && parsed.categories.length ? parsed.categories : DEFAULT_SITE_DATA.categories,
                stock: parsed.stock && parsed.stock.length ? parsed.stock : DEFAULT_SITE_DATA.stock,
                popup: { ...DEFAULT_SITE_DATA.popup, ...(parsed.popup || {}) },
                ads: parsed.ads || [],
                adsSettings: { ...DEFAULT_SITE_DATA.adsSettings, ...(parsed.adsSettings || {}) },
                gallery: parsed.gallery && parsed.gallery.length ? parsed.gallery : DEFAULT_SITE_DATA.gallery,
                maintenance: { ...DEFAULT_SITE_DATA.maintenance, ...(parsed.maintenance || {}) },
                notifications: parsed.notifications || [],
                newsBannerSettings: { ...DEFAULT_SITE_DATA.newsBannerSettings, ...(parsed.newsBannerSettings || {}) },
                customLinks: parsed.customLinks || [],
                customPages: parsed.customPages || [],
                sidebarOverrides: parsed.sidebarOverrides || {},
                contact: { ...DEFAULT_SITE_DATA.contact, ...(parsed.contact || {}) },
                footerDesc: parsed.footerDesc || DEFAULT_SITE_DATA.footerDesc,
                marqueeText: parsed.marqueeText || DEFAULT_SITE_DATA.marqueeText,
                events: parsed.events || [],
                branding: { ...DEFAULT_SITE_DATA.branding, ...(parsed.branding || {}) }
            };
        }

        function loadSiteData() {
            try {
                const raw = localStorage.getItem(SITE_DATA_KEY);
                if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
                return mergeSiteData(JSON.parse(raw));
            } catch (e) {
                console.error('Site data load failed, using defaults', e);
                return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
            }
        }

        function saveSiteData() {
            try {
                localStorage.setItem(SITE_DATA_KEY, JSON.stringify(currentSiteData));
            } catch (e) {
                console.error('Local save failed', e);
            }
            // Push to Firestore too, if configured — see FIREBASE SETUP block below.
            if (typeof pushSiteDataToFirestore === 'function') {
                pushSiteDataToFirestore(currentSiteData);
            }
            return true;
        }

        window.currentSiteData = loadSiteData();

        const BUILTIN_SIDEBAR_KEYS = [
            { key: 'account', label: 'Sign In / Create Account' },
            { key: 'home', label: 'Dashboard' },
            { key: 'lang', label: 'Change Language' },
            { key: 'theme', label: 'Dark/Light Mode' },
            { key: 'about', label: 'About Us' },
            { key: 'ethics', label: 'Ethics & Rules' },
            { key: 'services', label: 'Our Services' },
            { key: 'catalogue', label: 'Catalogue / Stock' },
            { key: 'track', label: 'Track My Order' },
            { key: 'reviews', label: 'Reviews Wall' },
            { key: 'gallery', label: 'Store Gallery' },
            { key: 'notifications', label: 'News & Notifications' },
            { key: 'events', label: 'Events' },
            { key: 'contact', label: 'Location & Contact' },
            { key: 'privacy', label: 'Privacy Policy' },
            { key: 'terms', label: 'Terms of Service' },
            { key: 'install', label: 'Install Taj App' }
        ];

        function formatPk(num) {
            if (!num) return '';
            const digits = num.replace(/\D/g, '');
            return digits.length === 11 ? digits.slice(0, 4) + ' ' + digits.slice(4) : num;
        }


// Initial load: localStorage cache first (works instantly, even
// offline or before Firebase is configured). firebase-sync.js will
// overwrite this with live Firestore data shortly after, if configured.
window.currentSiteData = loadSiteData();
