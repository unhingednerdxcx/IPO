import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { showContext } from "./script.js"; // js because after its compiled, its a js file
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
const storage = getStorage();
let uid;
onAuthStateChanged(auth, async (user) => {
    if (user) { // checks if user object actuallly exists or not
        let pfpUrl = user.photoURL;
        console.log(pfpUrl);
        let name = user.displayName || (user.providerData && user.providerData[0]?.displayName) || "User";
        uid = user.uid;
        console.log(uid);
        complete(name, pfpUrl, uid);
        console.log(await eel.notcheckedtoday()());
        if (await eel.notcheckedtoday()()) {
            clearChallangeData();
        }
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
document.getElementById('mail-enter').addEventListener('click', async () => {
    sign_up();
});
document.getElementById('sign-in-op').addEventListener('click', async () => {
    login_mail();
});
async function sign_up() {
    document.getElementById('sign-in').style.display = 'none';
    let box = document.getElementById('msg-box');
    let mail = await showContext("Enter you're email");
    console.log(mail);
    while (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail))) {
        box.innerText = "Enter a correct email";
        box.classList.add('active');
        setTimeout(() => {
            box.classList.remove('active');
        }, 4000);
        mail = await showContext("Enter you're email");
    }
    box.innerText = "Password must be atleast 8 characters and contain a number and a uppercase letter";
    box.classList.add('active');
    setTimeout(() => {
        box.classList.remove('active');
    }, 4000);
    let pass = await showContext("Enter you're password");
    console.log(pass);
    while (pass.length < 8 || !/[0-9]/.test(pass) || !/[A-Z]/.test(pass)) {
        let box = document.getElementById('msg-box');
        box.innerText = "Password must be atleast 8 characters and contain a number and a uppercase letter";
        box.classList.add('active');
        setTimeout(() => {
            box.classList.remove('active');
        }, 4000);
        pass = await showContext("Enter you're password");
    }
    try {
        let cred = await createUserWithEmailAndPassword(auth, mail, pass);
        let user = cred.user;
        await sendEmailVerification(user);
        await signOut(auth);
        box.innerText = "Sign in after reload...";
        box.classList.add('active');
        setTimeout(() => {
            box.classList.remove('active');
            window.location.reload();
        }, 4000);
    }
    catch (e) {
        box.innerText = `ERROR:- ${e}`;
        box.classList.add('active');
        setTimeout(() => {
            box.classList.remove('active');
            window.location.reload();
        }, 2000);
    }
}
async function login_mail() {
    document.getElementById('sign-in').style.display = 'none';
    let mail = await showContext("Hi again, enter you're mail");
    let pass = await showContext("Enter your password");
    let user;
    try {
        let userCredential = await signInWithEmailAndPassword(auth, mail, pass);
        user = userCredential.user;
        if (!user.emailVerified) {
            await signOut(auth);
            let box = document.getElementById('msg-box');
            box.innerText = "Access Denied, please check your inbox and verify your account first";
            box.classList.add('active');
            setTimeout(() => {
                box.classList.remove('active');
                window.location.reload();
            }, 4000);
        }
    }
    catch (e) {
        let box = document.getElementById('msg-box');
        box.innerText = `ERROR:- ${e}`;
        box.classList.add('active');
        setTimeout(() => {
            box.classList.remove('active');
            window.location.reload();
        }, 4000);
    }
    let pfpUrl = user.photoURL;
    let name = user.displayName || (user.providerData && user.providerData[0]?.displayName);
    if (!(name || pfpUrl)) {
        const storeRef = ref(storage, `avatars/${user.uid}.jpg`);
        let name = await showContext("What should we call you?");
        let pfp = await showContext("Enter profile picture", "file");
        if (!pfp)
            throw new Error("No file selected");
        let snapshot = await uploadBytes(storeRef, pfp);
        let downloadURL = await getDownloadURL(snapshot.ref);
        await updateProfile(user, {
            displayName: name,
            photoURL: downloadURL
        });
    }
}
async function login_gmail() {
    try {
        let res = await signInWithPopup(auth, googleProv);
        let user = res.user;
        console.log("USER:", user);
        console.log(Object.keys(user));
        let pfpUrl = user.photoURL;
        console.log(pfpUrl);
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
    console.log(await eel.notcheckedtoday()());
    if (await eel.notcheckedtoday()()) {
        clearChallangeData();
    }
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
    let ref = doc(db, "Tasks", "Tasks"); // You can think of ref as providing the path to the task
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
            xp = max - Math.abs(xp);
            // Math.abs means turn 9 -> -9, -34 -> -34, -Math.abs means, 9 -> -9, 9 or,
            //             -34 -> -34 -> 34 (or in simple words, turns any number positive). this is
            //             important becuase if i decreaseXP with a negative number, - and - would make + and
            //             now xp is being increased instead
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
export async function clearChallangeData() {
    console.log("here");
    let TasksDone = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ];
    console.log(uid);
    let ref;
    ref = doc(db, "users", uid);
    await updateDoc(ref, {
        TasksDone: TasksDone
    });
}
//# sourceMappingURL=signinx.js.map