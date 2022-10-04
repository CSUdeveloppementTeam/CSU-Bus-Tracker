let login = document.getElementById("login_btn"); 
login.addEventListener("click", function (e) {
    e.preventDefault(); 
    let email = document.getElementById("user_email").value; 
    let password = document.getElementById("user_password").value; 
    console.log(email);
    console.log(password);
    
})