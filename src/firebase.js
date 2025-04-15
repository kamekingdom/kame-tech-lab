// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestoreのインポート
import { getStorage } from "firebase/storage";     // Storageのインポート
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  // Authenticationのインポート

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLgDAXEVkMW1ql8EniWHa4S-UwgMHobuI",
    authDomain: "kame-tech-lab.firebaseapp.com",
    projectId: "kame-tech-lab",
    storageBucket: "kame-tech-lab.appspot.com",
    messagingSenderId: "76007831551",
    appId: "1:76007831551:web:7b4b4b3e320d2878e459ca",
    measurementId: "G-4611C3KE40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// FirestoreとStorageのインスタンスを初期化
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// db, storage, authをエクスポート
export { app, db, storage, auth };
