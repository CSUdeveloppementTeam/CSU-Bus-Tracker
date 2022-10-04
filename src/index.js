import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserInfo, writeUserInfo } from "./db_repository.js";
import { getDatabase, ref, onValue} from "firebase/database";
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

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     const uid = user.uid;
//     console.log(`connected user: ${uid}`);
//     getUserInfo(db, 'azertyuiop');
//     busLocations();
//   } else {
//     // User is signed out
//     console.log(`Not connected user`);
//   }
// });

// const signUpEvent = document.getElementById("signUpBtn");
// console.log(signUpEvent);
const signInEvent = document.getElementById("login_btn");
// console.log(signInEvent)
// const signOutEvent = document.getElementById("signOutBtn");
// console.log(signOutEvent);
// const emailVerficationBtnEvent = document.getElementById("emailVerficationBtn");
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
// signUpEvent.addEventListener('click', (e) => {
//   e.preventDefault();
//   signUpUser();
// });
function signUpUser() {
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
  }
  signUp(auth, user);
}

// signInEvent.addEventListener('click', signInUser);
function signInUser() {
  console.log("signin");
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
  }
  signIn(auth, user);
}

// emailVerficationBtnEvent.addEventListener('click', function () {
//   sendToUserEmailVerificationLink(auth);
// });

// signOutEvent.addEventListener('click', function (e) {
//   e.preventDefault();
//   signOutUser(auth);
// });

function busLocations() {
  //const busLocationsref = ref(db, 'busLocationsTest');
  console.log('BusLocations is called');
   onValue(ref(db, 'busLocationsTest'), (snapshot) => {
    console.log("inside");
    var loc = snapshot.val()
    var data = JSON.stringify(loc);
    console.log(data);
  });
}
