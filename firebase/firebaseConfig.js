// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDI-pmwQK3N-IueZYVLT0zx5YXtPJt5E_w",
  authDomain: "flutter-app-409c1.firebaseapp.com",
  projectId: "flutter-app-409c1",
  storageBucket: "flutter-app-409c1.appspot.com",
  messagingSenderId: "524576775315",
  appId: "1:524576775315:web:131cc07d3139f2e8970166"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksport Firestore
export const db = getFirestore(app);
