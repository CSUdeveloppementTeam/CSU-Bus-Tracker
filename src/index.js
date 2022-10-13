import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { deleteUser, getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserInfo} from "./db_repository.js";
import { getDatabase} from "firebase/database";
import { signIn, signOutUser, signUp, resetPassword, checkEmailVerification } from "./auth.js";
import { busLocations, setIsScreenLocked, getUserPosition, calculateUserAndBusDistance, setSelectedBus, displayUserPosition, deselectBus} from "../map/map_controller.js";
import { initMap } from "../map/map_init.js";

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

let wasAlreadyConnected = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(`connected user: ${user.email}`);
    getUserInfo(db, user.uid);
    var fileName = location.href.split("/").pop();
    if(fileName !== "CSU-Bus-Tracker/main_page.html"){
      // location.replace("../main_page.html");
      checkEmailVerification(auth);
    } else {
      busLocations(db, window.mapObj);
    }
    wasAlreadyConnected = true;
  } else {
    console.log(`Not connected user`);
    var fileName = location.href.split("/").pop();
    console.log("file: "+fileName);
    if(wasAlreadyConnected){
      if(fileName !== "index.html"){
        location.replace("../index.html");
      }
    }
  }
});

function checkVer() {
  checkEmailVerification(auth);
}
window.checkVer = checkVer;
function userSignup () {
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
    "name": document.getElementById("username").value
  }
  signUp(auth, user);
  console.log("signed the user up");
}
window.userSignup = userSignup; 



// logout
function logout () {
  console.log("logout trial");
  signOutUser(auth);
}
window.logout = logout; 

//login 
function login () {

  console.log("connexion trial");
  const user = {
    "email": document.getElementById("user_email").value,
    "password": document.getElementById("user_password").value,
  }
  let result = signIn(auth, user);
  console.log(result); 
  if (result.isError == true) {
    alert(result.errorMessage);
  }
}
window.login = login; 

// Password reset 
function forgotten() {
  const overlay = document.createElement("div"); 
  overlay.id = "overlay"; 

  const form = document.createElement('div');
  form.id = "forgotten_form";
  form.innerHTML = "<img src='../images/close_pop.png' class='close_popup' ><h1>Forgotten Password</h1><p>Enter your account email adress, an email will be sent to you with the link to reset your password.</p><input type='email' id='email_reset' placeholder='Your account Email' required><br><br><button class='login_button' id='reset_btn' >Reset Password</button>" 
  overlay.appendChild(form); 
  document.querySelector("body").appendChild(overlay); 

  document.querySelector(".close_popup").addEventListener('click', function () {
    overlay.remove();
  })
  document.getElementById("reset_btn").addEventListener('click', function () {
    resetPassword(auth, document.getElementById("email_reset").value);
    form.innerHTML = "<img src='../images/close_pop.png' class='close_popup' ><h2>An Email has been sent to allow you to reset your password</h2><button class='link_button' onclick=' window.open(`https://outlook.com`,`_blank`);signUpUser' >Go to Mail (Outlook.com)</button>"
  })
};
window.forgotten = forgotten; 

// Lock Screen button 
window.mapLockStat = false; 
function lockScreen () {
    if (window.mapLockStat == true) {
        setIsScreenLocked(false); 
        window.mapLockStat = false;
    } else {
        setIsScreenLocked(true);
        window.mapLockStat = true;
    }
};
window.lockScreen = lockScreen; 

// actual student location 
function showStudentLoc() {
  deselectBus(); 
  getUserPosition(function () {
    displayUserPosition();
  });
};
window.showStudentLoc = showStudentLoc; 

// bus to user distance 

function updateD() {
  console.log('Calculate the distance')
  let distance;
  if (window.hasOwnProperty('selectedBus')) {
    if (window.selectedBus != null) {
      getUserPosition(function () {
        distance = Math.round(calculateUserAndBusDistance());
        console.log("distance in meter = " + distance);
        if (distance == false) {
          document.getElementById("distance_display").innerHTML = ""; 
        } else {
        document.getElementById("distance_display").innerHTML = distance + "m"; 
        }
      });
    } else {
      alert("The bus is not selected");
    } 
  } else {
    alert("Select a bus first"); 
  }
}
window.updateD = updateD; 


// set the selected bus 
function select() {
  
  for (let i = 0; i < window.availableBuses.length; i++) {
    if (window.availableBuses[i].busId == document.querySelector(".bus_selector").value) {
      setSelectedBus(window.availableBuses[i]);
      break; 
    }
  } 
  // real-time position updade 
  navigator.geolocation.watchPosition(updateD, (err) => {
    console.error(`ERROR(${err.code}): ${err.message}`);
  });
  // updateD(); 
};
window.Pressed = select; 

// map 
window.initMap = initMap; 



