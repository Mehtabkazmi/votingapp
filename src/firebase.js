import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgm0fZiDYneTq9eh_wKgT8mzvvax5h4iw",
  authDomain: "votingapp-294f4.firebaseapp.com",
  projectId: "votingapp-294f4",
  storageBucket: "votingapp-294f4.firebasestorage.app",
  messagingSenderId: "177588410708",
  appId: "1:177588410708:web:043f06c84d241330e3d0c1",
  measurementId: "G-EP5ZVF50BN",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
