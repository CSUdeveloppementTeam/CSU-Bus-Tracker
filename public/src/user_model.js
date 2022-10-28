
class UserModel{
    constructor(key, name, email, creationDate){
        this.key, 
        this.name, 
        this.email, 
        this.creationDate
    }

      fromJson(documentSnapshot) {
        return UserModel(
            this.key = documentSnapshot['key'],
            this.name = documentSnapshot["name"],
            this.email = documentSnapshot["email"],
            this.creationDate = documentSnapshot['creationDate'],
          );
    }

     toJson(){
        return {
          'key': key,
          'name': name,
          'email': email,
          'creationDate': creationDate,
        };
     }
}

export default UserModel;