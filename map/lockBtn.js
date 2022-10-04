
let state = false; 
document.querySelector(".lock").addEventListener("click", function () {
    if (state == true) {
        document.querySelector(".lock_panel").remove();
        state = false;
    } else {
        var lockPanel = document.createElement("div");
        lockPanel.classList.add("lock_panel");
        document.getElementById("map").prepend(lockPanel);
        state = true;
    }
});
