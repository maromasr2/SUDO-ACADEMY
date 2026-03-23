// بيانات مشروع Sudo Academy الحقيقية
const firebaseConfig = {
  apiKey: "AIzaSyBk4wMsyAvBzmm71IbAMS3JdvpeslQQip0",
  authDomain: "sudo-academy.firebaseapp.com",
  projectId: "sudo-academy",
  storageBucket: "sudo-academy.firebasestorage.app",
  messagingSenderId: "1081275928497",
  appId: "1:1081275928497:web:e3a8c64851edf6f80f3790",
  measurementId: "G-XSVFDWVNSF"
};

// تشغيل الفيربيز بنظام الـ Compatibility عشان يقرأ من app.js و admin.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();