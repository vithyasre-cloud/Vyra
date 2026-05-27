import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE8XRQBXdP2SctEqNp7jyeTQpCHwUFa-I",
  authDomain: "vyra-b693f.firebaseapp.com",
  projectId: "vyra-b693f",
  storageBucket: "vyra-b693f.firebasestorage.app",
  messagingSenderId: "810634730739",
  appId: "1:810634730739:web:4891f32e39631ed52bab86",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);