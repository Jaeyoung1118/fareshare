// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPRKk81nZXPqa5SyM4A8epGFbs1Zy8iJY",
  authDomain: "fareshare-7fa54.firebaseapp.com",
  projectId: "fareshare-7fa54",
  storageBucket: "fareshare-7fa54.appspot.com",
  messagingSenderId: "795548998124",
  appId: "1:795548998124:web:9456d82f4c06cb9753c8c9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
