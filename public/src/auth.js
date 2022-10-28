import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendEmailVerification, signOut, updatePassword, sendPasswordResetEmail
} from "firebase/auth";
import { writeUserInfo } from "./db_repository";
import {authExceptionHandler} from "../src/AuthExceptionHandler.js"
import { displayMessage } from "./message_display";
let userDetails;
export const signUp = (auth, user, db) => {
   const { email, password, name} = user;
   const mailEnd = email.split("@").pop();
    if (mailEnd == "stu.csu.edu.tr" || mailEnd == "csu.edu.tr") {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                userDetails = {
                    "email": userCredential.user.email,
                    "name": name,
                    "creationDate": userCredential.user.metadata.creationTime,
                    "key": userCredential.user.uid,
                }
                writeUserInfo(db, userDetails);
                sendToUserEmailVerificationLink(auth);
                setTimeout(function(){
                    document.getElementById('auth_message').scrollIntoView();
                }, 500);
            })
            .catch((error) => {
                const status = authExceptionHandler.handleException(error);
                const errorMessage = authExceptionHandler.generateExceptionMessage(status);
                displayMessage(errorMessage);
            });
        } else {
            displayMessage("Sorry the email you entered is not a CSU student email");
        }
}

const sendToUserEmailVerificationLink = (auth) => {
    sendEmailVerification(auth.currentUser)
        .then(() => {
            document.getElementById("auth_message").style.display = 'grid';
            document.getElementById("auth_tutorial").style.display = "block";
            checkEmailVerification(auth);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            displayMessage(errorMessage);
        });
}


export function checkEmailVerification(auth) {
    setInterval(function () {
      if (auth.currentUser.emailVerified) {
        location.replace("../main_page.html"); 
      } else {
        displayMessage("Sorry, your email adress is not verified. <br> Please, access you email Inbox (through outlook.com) and click on verification link.");
      }
    }, 2000);
  }

export const signIn = (auth, { email, password }) => {
    const mailEnd = email.split("@").pop();
    if (mailEnd == "stu.csu.edu.tr" || mailEnd == "csu.edu.tr") {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            checkEmailVerification(auth);
        })
        .catch((error) => {
            const status = authExceptionHandler.handleException(error);
            const errorMessage = authExceptionHandler.generateExceptionMessage(status);
            displayMessage(errorMessage);
        });
    } else {
        displayMessage("Sorry the email you entered is not a CSU student email");
    }
}


export function signOutUser(auth) {
    signOut(auth).then(() => {
        location.replace('../login.html');
    }).catch((error) => {
        const status = authExceptionHandler.handleException(error);
        const errorMessage = authExceptionHandler.generateExceptionMessage(status);
        displayMessage(errorMessage);
    });
}

export function updateUserPassword(auth, newPassword){
    updatePassword(auth.currentUser, newPassword).then(() => {
      }).catch((error) => {
        const status = authExceptionHandler.handleException(error);
        const errorMessage = authExceptionHandler.generateExceptionMessage(status);
        displayMessage(errorMessage);
      });
}
 
export function resetPassword(auth, email) {
    // var actionCodeSettings = {
    //     url: 'https://csudeveloppementteam.github.io/CSU-Bus-Tracker/',
    //   };
    sendPasswordResetEmail(auth, email).then(() => {
    // Password reset email sent!
    // ..
  })
  .catch((error) => {
    const status = authExceptionHandler.handleException(error);
    const errorMessage = authExceptionHandler.generateExceptionMessage(status);
    displayMessage(errorMessage);
  });
    
}
