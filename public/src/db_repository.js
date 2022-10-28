import { ref, set, onValue,} from "firebase/database";

export async function writeUserInfo(db, user) {
  const { name, creationDate, email, key} = user
  try {
    await set(ref(db, 'users/'+ key + '/info'), {
      name: name,
      email: email,
      creationDate: creationDate,
      key: key,
    });
    console.log("user added successfully");
    return true;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`Write user info: errorCode: ${errorCode}, errorMessage: ${errorMessage}`);
    return false;
  }
}

export function getUserInfo(db, key) {
  onValue(ref(db, 'users/' + key + '/info'), (snapshot) => {
    const info = (snapshot.val());
   if(info !== null || info === undefined){
    var userInfo = JSON.stringify(info);
   }
    //  console.log(`info stringified: ${userInfo}`);
  }, {
    onlyOnce: true
  });
}

// export function busLocations(db) {
//   const busLocationsref = ref(db, 'busLocationsTest');
//   return onValue(busLocationsref, (snapshot) => {
//     print(snaphot);
//   });
// }

// export const busLocations = (db) => {
//   const busLocationsRef = ref(db, 'busLocationsTest/');
//   return Promise((resolve, reject) => {
//     const onData = data => resolve(data);
//     const onError = error => reject(error);
//     busLocationsRef.on('value', onData, onError);
//   });
// };