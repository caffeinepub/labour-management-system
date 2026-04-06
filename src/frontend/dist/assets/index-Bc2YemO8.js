import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, setPersistence, browserSessionPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const firebaseConfig = {
  apiKey: "AIzaSyAtgPc7BfOZpBtVNwVmy2qjVR5KGf1uDxA",
  authDomain: "labourmanagement-4c5d3.firebaseapp.com",
  projectId: "labourmanagement-4c5d3",
  storageBucket: "labourmanagement-4c5d3.firebasestorage.app",
  messagingSenderId: "603898201221",
  appId: "1:603898201221:web:5057502261403033da55ec",
  measurementId: "G-LRVKVFHMBK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setPersistence(auth, browserSessionPersistence).catch((err) => console.error("Persistence error:", err));
const connEl = document.getElementById("conn-status");
(async () => {
  try {
    await getDoc(doc(db, "_ping", "test")).catch(() => {
    });
    connEl.textContent = "✅ Connected";
    connEl.className = "connected";
  } catch (e) {
    connEl.textContent = "❌ Connection Error";
    connEl.className = "error";
    console.error("Firebase connection failed:", e);
  }
})();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const role = snap.data().role;
        if (role === "admin") window.location.href = "/admin.html";
        else if (role === "labour") window.location.href = "/labour.html";
      }
    } catch (e) {
      console.error("Role check error:", e);
    }
  }
});
window.switchTab = function(tab) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  if (tab === "login") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    tabLogin.classList.remove("active");
    tabSignup.classList.add("active");
  }
};
window.showToast = function(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.textContent = (icons[type] || "") + " " + msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("dismiss");
    setTimeout(() => toast.remove(), 350);
  }, 3e3);
};
function getFriendlyError(error) {
  const code = (error == null ? void 0 : error.code) || error;
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid email or password."
  };
  return map[code] || error.message || "Something went wrong. Please try again.";
}
window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("login-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Signing in...';
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      showToast("Account data not found. Contact admin.", "error");
      btn.disabled = false;
      btn.textContent = "Sign In";
      return;
    }
    const userData = snap.data();
    showToast("Welcome back, " + userData.name + "! 👋", "success");
    setTimeout(() => {
      if (userData.role === "admin") window.location.href = "/admin.html";
      else window.location.href = "/labour.html";
    }, 800);
  } catch (err) {
    console.error("Auth Error:", err);
    alert(err.message);
    showToast(getFriendlyError(err), "error");
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
};
window.handleSignup = async function(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const role = document.getElementById("signup-role").value;
  const btn = document.getElementById("signup-btn");
  if (!name) {
    showToast("Please enter your full name.", "error");
    return;
  }
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Creating account...';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      role,
      dailyRate: 0
    });
    showToast("Account created! Welcome, " + name + " 🎉", "success");
    setTimeout(() => {
      if (role === "admin") window.location.href = "/admin.html";
      else window.location.href = "/labour.html";
    }, 800);
  } catch (err) {
    console.error("Auth Error:", err);
    alert(err.message);
    showToast(getFriendlyError(err), "error");
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
};
