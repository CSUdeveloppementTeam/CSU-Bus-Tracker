import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendEmailVerification, signOut, updatePassword
} from "firebase/auth";

export let userCredentials
export const signUp = (auth, { email, password }) => {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            userCredentials = userCredential;
            console.log("user signed up successfully");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`errorCode: ${errorCode}, errorMessage: ${errorMessage}`);
        });
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


export const sendToUserEmailVerificationLink = (auth) => {
    sendEmailVerification(auth.currentUser)
        .then(() => {
            console.log('Verifiction email sent');
        }).catch((error) => {
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