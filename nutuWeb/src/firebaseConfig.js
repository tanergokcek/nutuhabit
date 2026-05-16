import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBIhj06-QddKYbj4gRYmBFAMs6wcpjHnqI",
    authDomain: "nutuhabit.firebaseapp.com",
    projectId: "nutuhabit",
    storageBucket: "nutuhabit.firebasestorage.app",
    messagingSenderId: "882584952431",
    appId: "1:882584952431:web:3f1235d37120dbcf45779a",
    measurementId: "G-4LQBT6DK8H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
