
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// Configuração do projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCZe5570OYsCxiXuV6duyg6t_E2HXZou80",
  authDomain: "constellarium-772a0.firebaseapp.com",
  projectId: "constellarium-772a0",
  storageBucket: "constellarium-772a0.firebasestorage.app",
  messagingSenderId: "147443899487",
  appId: "1:147443899487:web:6ae4ff283ce01a8d400fea",
  measurementId: "G-3J8D3HWC3Q"
};
// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa autenticação
export const auth = getAuth(app);

// Provedor de login Google
export const googleProvider = new GoogleAuthProvider();
