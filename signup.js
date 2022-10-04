let signup = document.getElementById("signup_btn"); 
signup.addEventListener("click", function (e) {
    e.preventDefault(); 
    let username = document.getElementById("username").value; 
    let email = document.getElementById("user_email").value; 
    let password = document.getElementById("user_password").value; 
    console.log(username);
    console.log(email);
    console.log(password);


    show_auth_message();
})


// view the authentication tutorial section
    ///////////////////////////////////////////
function show_auth_message(){
    document.getElementById("auth_message").style.display = 'grid';
    document.getElementById("auth_tutorial").style.display = "block";

    setTimeout(function(){
        document.getElementById('auth_message').scrollIntoView();
    }, 500);   
}