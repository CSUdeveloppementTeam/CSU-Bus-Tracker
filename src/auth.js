import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendEmailVerification, signOut, updatePassword, sendPasswordResetEmail
} from "firebase/auth";
import { writeUserInfo } from "./db_repository";

let userDetails;
export const signUp = (auth, user) => {
   const { email, password, name} = user;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            userDetails = {
                "email": userCredential.user.email,
                "name": name,
                "creationDate": userCredential.user.metadata.creationTime,
                "key": userCredential.user.uid,
              }
            console.log("user signed up successfully");
            sendToUserEmailVerificationLink(auth);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`errorCode: ${errorCode}, errorMessage: ${errorMessage}`);
        });
}

const sendToUserEmailVerificationLink = (auth) => {
    sendEmailVerification(auth.currentUser)
        .then(() => {
            console.log('Verifiction email sent');
            checkEmailVerification(auth);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`errorCode: ${errorCode}, errorMessage: ${errorMessage}`);
        });
}


export function checkEmailVerification(auth, db) {
    document.getElementById("auth_message").style.display = 'grid';
    document.getElementById("auth_tutorial").style.display = "block";
    setTimeout(function(){
        document.getElementById('auth_message').scrollIntoView();
    }, 500);
    setInterval(function () {
      if (auth.currentUser.emailVerified) {
        writeUserInfo(db, userDetails);
        location.replace("../main_page.html"); 
      } else {
        alert("Email not verified !"); 
      }
    }, 2000);
  }

export const signIn = (auth, { email, password }) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log("user signed in successfully" + user);
            location.replace("../main_page.html");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`errorCode: ${errorCode}, errorMessage: ${errorMessage}`);
        });
}


export function signOutUser(auth) {
    signOut(auth).then(() => {
        console.log('Signed Out');
        location.replace('../login.html');
    }).catch((error) => {
        console.error('Sign Out Error', error);
    });
}

export function updateUserPassword(auth, newPassword){
    updatePassword(auth.currentUser, newPassword).then(() => {
        console.log('Updated')
      }).catch((error) => {
        console.error('Update Password Error', error);
      });
}
 
export function resetPassword(auth, email) {
    // var actionCodeSettings = {
    //     url: 'https://csudeveloppementteam.github.io/CSU-Bus-Tracker/',
    //   };
    sendPasswordResetEmail(auth, email).then(() => {
    // Password reset email sent!
    // ..
    console.log("the email has been sent succesfully !");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
    console.log(errorMessage, errorCode);
  });
    
}