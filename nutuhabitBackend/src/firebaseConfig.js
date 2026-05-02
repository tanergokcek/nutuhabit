import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyBIhj06-QddKYbj4gRYmBFAMs6wcpjHnqI",
    authDomain: "nutuhabit.firebaseapp.com",
    projectId: "nutuhabit",
    storageBucket: "nutuhabit.firebasestorage.app",
    messagingSenderId: "882584952431",
    appId: "1:882584952431:web:3f1235d37120dbcf45779a",
    measurementId: "G-4LQBT6DK8H"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth yapılandırması (Mobil için persistence şart)
const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

export const db = getFirestore(app);
export { auth };
export default app;