import {login} from "src/";
let login_btn = document.getElementById("login_btn"); 
login_btn.addEventListener("click", function (e) {
    e.preventDefault(); 
    let email = document.getElementById("user_email").value; 
    let password = document.getElementById("user_password").value; 
    login(email, password);
    
})