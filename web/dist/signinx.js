import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const Config = {
    apiKey: "AIzaSyDiXBfMU_Kfj2yrklW1yWrMNvEHBRcq848",
    authDomain: "sequender-73c25.firebaseapp.com",
    projectId: "sequender-73c25",
    storageBucket: "sequender-73c25.firebasestorage.app",
    messagingSenderId: "1014069818908",
    appId: "1:1014069818908:web:9fd046f8022c6e401311d9"
};
const app = initializeApp(Config);
const auth = getAuth(app);
let uid;
onAuthStateChanged(auth, (user) => {
    if (user) {
        let pfpUrl = user.photoURL;
        let name = user.displayName || (user.providerData && user.providerData[0]?.displayName) || "User";
        uid = user.uid;
        complete(name, pfpUrl, uid);
    }
    else {
        document.getElementById('sign-in').style.display = "flex";
    }
});
const googleProv = new GoogleAuthProvider();
const uidx = "";
const db = getFirestore();
document.getElementById('gmail-enter').addEventListener('click', async () => {
    login_gmail();
});
async function login_gmail() {
    try {
        let res = await signInWithPopup(auth, googleProv);
        let user = res.user;
        console.log("USER:", user);
        console.log(Object.keys(user));
        let pfpUrl = user.photoURL;
        let name = user.displayName || (user.providerData && user.providerData[0]?.displayName) || "User";
        uid = user.uid;
        console.log(uid, uidx);
        complete(name, pfpUrl, uid);
        return true;
    }
    catch (e) {
        console.log("NO LOG IN DUE TO:", e);
        return false;
    }
}
async function complete(name, pfp, uid) {
    console.log(pfp);
    document.getElementById('sign-in').style.display = 'none';
    document.getElementById('username').innerText = name;
    document.getElementById('userpfp').src = pfp;
    console.log(document.getElementById('userpfp').src);
    console.log(document.getElementById('userpfp'));
    console.log(document.getElementById('username'));
    let ref = doc(db, "users", uid);
    if (!(await eel.loggedin()())) {
        await setDoc(ref, {
            "xp": 0,
            "maxXp": 100,
            "level": 0,
            "TasksDone": [false, false, false, false, false, false, false],
        });
        await eel.setloggedin();
    }
    let content = await getDoc(ref);
    if (content.exists()) {
        console.log(content.data());
        let data = content.data();
        document.getElementById('xp').innerText = `Xp: ${data.xp}/${data.maxXp}`;
        document.getElementById('lvl').innerText = `Level: ${data.level}`;
    }
    else {
        console.log("ERROR:- content not found");
    }
}
export async function updateInfo() {
    let ref = doc(db, "users", uid);
    let content = await getDoc(ref);
    if (content.exists()) {
        console.log(content.data());
        let data = content.data();
        document.getElementById('xp').innerText = `Xp: ${data.xp}/${data.maxXp}`;
        document.getElementById('lvl').innerText = `Level: ${data.level}`;
    }
}
export async function listTodaysChallange() {
    let ref = doc(db, "Tasks", "Tasks");
    let content = await getDoc(ref);
    if (content.exists()) {
        let data = content.data();
        return data;
    }
    return ["ERROR COULD NOT RECIEVE DATA"];
}
export async function listCompletedTasks() {
    let ref = doc(db, "users", uid);
    let content = await getDoc(ref);
    if (content.exists()) {
        let data = content.data();
        return data.TasksDone;
    }
}
export async function increaseXP(gotXp) {
    gotXp = Number(gotXp);
    const uid = getAuth().currentUser?.uid;
    console.log(uid);
    let ref = doc(db, "users", uid);
    let content = await getDoc(ref);
    if (content.exists()) {
        let data = content.data();
        let level = data.level;
        let max = data.maxXp;
        let xp = data.xp + gotXp;
        while (xp >= max) {
            xp -= max;
            level += 1;
            max *= 2;
        }
        await updateDoc(ref, {
            xp,
            maxXp: max,
            level
        });
    }
}
export async function decreaseXP(gotXp) {
    gotXp = Number(gotXp);
    const uid = getAuth().currentUser?.uid;
    console.log(uid);
    let ref = doc(db, "users", uid);
    let content = await getDoc(ref);
    if (content.exists()) {
        let data = content.data();
        let level = data.level;
        let max = data.maxXp;
        let xp = data.xp - gotXp;
        if (xp < 0) {
            max /= 2;
            xp = max - Math.abs(xp); // +- = -, -- = + !!
            level -= 1;
        }
        await updateDoc(ref, {
            xp,
            maxXp: max,
            level
        });
    }
}
export async function setTask(key, val) {
    let ref = doc(db, "users", uid);
    let content = await getDoc(ref);
    if (content.exists()) {
        console.log(content.data());
        let data = content.data();
        let TasksDone = data.TasksDone;
        TasksDone[key] = val;
        await updateDoc(ref, {
            TasksDone: TasksDone
        });
    }
}
//# sourceMappingURL=signinx.js.map