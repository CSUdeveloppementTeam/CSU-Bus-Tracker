export function displayMessage(message) {
    const overlay = document.createElement("div"); 
    overlay.id = "overlay";

    const popUp = document.createElement('div');
    popUp.id = "popup";
    popUp.innerHTML = "<img src='../img/icons/close_pop.png' class='close_popup' ><h1>"+ message+"</h1>"; 
    overlay.appendChild(popUp); 
    document.querySelector("body").prepend(overlay); 

    document.querySelector(".close_popup").addEventListener('click', function () {
        overlay.remove();
    });
    overlay.addEventListener('click', function () {
        overlay.remove(); 
    });
}