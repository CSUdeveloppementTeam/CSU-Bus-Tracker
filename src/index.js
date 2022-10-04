import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserInfo, writeUserInfo } from "./db_repository.js";
import { getDatabase } from "firebase/database";
import { sendToUserEmailVerificationLink, signIn, signOutUser, signUp } from "./auth.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBgL1VUP0JLRMTXFKL19WaSi7aj9BPP-HU",
  authDomain: "csu-bus-tracker.firebaseapp.com",
  databaseURL: "https://csu-bus-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "csu-bus-tracker",
  storageBucket: "csu-bus-tracker.appspot.com",
  messagingSenderId: "830653908600",
  appId: "1:830653908600:web:14e31853133471602c8f8d",
  measurementId: "G-HBGYXYRFFT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
// const user = auth.currentUser;

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log(`connected user: ${uid}`);
    getUserInfo(db, 'azertyuiop');
  } else {
    // User is signed out
    console.log(`Not connected user`);
  }
});


const addUserEvent = document.getElementById("addUserBtn");
const signUpEvent = document.getElementById("signUpBtn");
const signInEvent = document.getElementById("signInBtn");
const signOutEvent = document.getElementById("signOutBtn");
const emailVerficationBtnEvent = document.getElementById("emailVerficationBtn");
// const busLocationsEvent =  document.getElementById("busLocationsBtn");

addUserEvent.addEventListener('click', addUser);
export function addUser() {
  const user = {
    "email": "shin@driver.csu.edu.tr",
    "name": "shin",
    "creationDate": "30/09/2022",
    "key": 'azertyuiop' //`${userCredentials.user.uid}`
  }
  writeUserInfo(db, user);
}

//Change the click event into submit
signUpEvent.addEventListener('click', (e) => {
  // e.preventDefault();
  signUpUser();
});
function signUpUser() {
  const user = {
    "email": "shin@driver.csu.edu.tr",
    "password": "123456",
  }
  signUp(auth, user)
}

signInEvent.addEventListener('click', signInUser);
function signInUser() {
  const user = {
    "email": "shin@driver.csu.edu.tr",
    "password": "123456",
  }
  signIn(auth, user);
}

emailVerficationBtnEvent.addEventListener('click', function () {
  sendToUserEmailVerificationLink(auth);
});

signOutEvent.addEventListener('click', function () {
  signOutUser(auth)
});

// function busLocations() {
//   // const busLocationsref = ref(db, 'busLocationsTest');
//    onValue(ref(db, 'busLocationsTest'), (snapshot) => {
//     print(snapshot);
//   });
// }