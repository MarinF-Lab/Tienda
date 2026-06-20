import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUOHFVM-mgS9VapGejljvAemdGg6SPbp0",
  authDomain: "tienda-647d4.firebaseapp.com",
  projectId: "tienda-647d4",
  storageBucket: "tienda-647d4.firebasestorage.app",
  messagingSenderId: "804392134816",
  appId: "1:804392134816:web:0976888d54938c561741c5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
