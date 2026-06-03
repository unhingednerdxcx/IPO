import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const Config = {
  apiKey: "AIzaSyDiXBfMU_Kfj2yrklW1yWrMNvEHBRcq848",
  authDomain: "sequender-73c25.firebaseapp.com",
  projectId: "sequender-73c25",
  storageBucket: "sequender-73c25.firebasestorage.app",
  messagingSenderId: "1014069818908",
  appId: "1:1014069818908:web:9fd046f8022c6e401311d9"
};

const app = initializeApp(Config);
const auth = getAuth(app)
const googleProv = new GoogleAuthProvider();
const user = "";

document.getElementById('gmail-enter').addEventListener('click', async() => {
    login_gmail()
})
async function login_gmail() {
    try {
        let res = await signInWithPopup(auth, googleProv)
        let user = res.user
        console.log("USER:", user)
        let pfpUrl = user.photoURL
        let name = user.displayName || (user.providerData && user.providerData[0]?.displayName) || "User"
        complete(name, pfpUrl)
        return true
    } catch (e) {
        console.log("NO LOG IN DUE TO:", e)
        return false
    }
}

function complete(name, pfp) {
    document.getElementById('sign-in').style.display = 'none'
    document.getElementById('username').innerText = name
    document.getElementById('userpfp').src = pfp
    console.log(document.getElementById('username'))
}