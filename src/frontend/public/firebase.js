// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  browserSessionPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Real Firebase config for labourmanagement-4c5d3
const firebaseConfig = {
  apiKey: "AIzaSyAtgPc7BfOZpBtVNwVmy2qjVR5KGf1uDxA",
  authDomain: "labourmanagement-4c5d3.firebaseapp.com",
  projectId: "labourmanagement-4c5d3",
  storageBucket: "labourmanagement-4c5d3.firebasestorage.app",
  messagingSenderId: "603898201221",
  appId: "1:603898201221:web:5057502261403033da55ec",
  measurementId: "G-LRVKVFHMBK"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Use session persistence — auth clears when tab/browser is closed
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.error("Persistence error:", err);
});

// ── Connection status indicator ──────────────────────────────
// Updates any element with id="connectionStatus" on the page
function updateConnectionStatus(connected, message) {
  const el = document.getElementById("connectionStatus");
  if (!el) return;
  if (connected) {
    el.textContent = "Connected ✅";
    el.style.color = "#16a34a"; // green
  } else {
    el.textContent = "Connection Error ❌ — " + (message || "Check your Firebase config");
    el.style.color = "#dc2626"; // red
  }
}

// Verify Firestore is reachable by doing a lightweight read
// (reads a non-existent doc — no data needed, just tests the connection)
try {
  const testRef = doc(db, "_connection_test", "ping");
  getDoc(testRef)
    .then(() => {
      updateConnectionStatus(true);
      console.log("✅ Firebase connected — Auth + Firestore ready");
    })
    .catch((err) => {
      updateConnectionStatus(false, err.message);
      console.error("❌ Firestore connection failed:", err);
    });
} catch (err) {
  updateConnectionStatus(false, err.message);
  console.error("❌ Firebase init error:", err);
}
