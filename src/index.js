import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserInfo, writeUserInfo } from "./db_repository.js";
import { getDatabase, ref, onValue} from "firebase/database";
import { sendToUserEmailVerificationLink, signIn, signOutUser, signUp, userCredentials } from "./auth.js";

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
    busLocations();
  } else {
    // User is signed out
    console.log(`Not connected user`);
    // location.replace("../login.html"); 
  }
});

// console.log(signUpEvent);
// console.log(signInEvent)
// const emailVerficationBtnEvent = document.getElementById("emailVerficationBtn");

//Change the click event into submit
const signUpEvent = document.getElementById("signUpBtn");
signUpEvent.addEventListener('click', (e) => {
  e.preventDefault();
  signUpUser();
  sendToUserEmailVerificationLink(auth);
  checkEmailVerification(); 
});

// repeated email verification check 
function checkEmailVerification() {

  document.getElementById("auth_message").style.display = 'grid';
  document.getElementById("auth_tutorial").style.display = "block";

  setTimeout(function(){
      document.getElementById('auth_message').scrollIntoView();
  }, 500);
  setInterval(function () {
    if (auth.currentUser.emailVerified) {
      addUser(); 
      location.replace("../main_page.html"); 
    }
  }, 2000);
}

// button to manually check the verified email 
document.getElementById("check_verf_btn").addEventListener("click", function (e) {
  console.log('check my verification');
  if (auth.currentUser.emailVerified) {
    addUser(); 
    location.replace("../main_page.html"); 
  }
})


function signUpUser() {
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
  }
  signUp(auth, user);
}

export function addUser() {
  const user = {
    "email": userCredentials.user.email ,
    "name": "shin",
    "creationDate": "30/09/2022",
    "key": userCredentials.user.uid //`${userCredentials.user.uid}`
  }
  writeUserInfo(db, user);
}

// Logout 
const signOutEvent = document.getElementById("signoutbtn");
console.log(signOutEvent);
window.addEventListener("load", function () {
  signOutEvent.addEventListener('click', () => {
    signOutUser(auth);
  });
})

//login 
const signInEvent = document.getElementById("login_btn");
signInEvent.addEventListener('click', function (e) {
  e.preventDefault();
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
  }
  signIn(auth, user);
});


function busLocations() {
  //const busLocationsref = ref(db, 'busLocationsTest');
  console.log('BusLocations is called');
   onValue(ref(db, 'busLocationsTest'), (snapshot) => {
    console.log("inside");
    var loc = snapshot.val()
    var data = JSON.stringify(loc);
    console.log(loc);
  });
}

