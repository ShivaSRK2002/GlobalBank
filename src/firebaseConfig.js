// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAl4mxNLf2uKq5ZngjBPppZ3q6lmhTUKcQ",
    authDomain: "banking-d6810.firebaseapp.com",
    projectId: "banking-d6810",
    storageBucket: "banking-d6810.appspot.com",
    messagingSenderId: "27330957948",
    appId: "1:27330957948:web:ed0944ee5a13b85569eff9",
    measurementId: "G-S4KHHLMVXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export auth and db
export { auth, db, storage };
