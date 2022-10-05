let mapObj;
import { createMarker } from "./makeMarker.js";
import { displayStudentLocation } from "./currentLocation.js";
import { animatedMove } from "./busMovement.js";
export function initMap() {
    let options = {
        center: { lat:  35.323, lng: 33.314 },
        zoom: 15,
        disableDefaultUI: true
    }
    
    mapObj = new google.maps.Map(document.getElementById("map"), options);
    
    let check = document.querySelector(".student_location_button").addEventListener("click", function (e) {
        displayStudentLocation(mapObj);
    });
  
    let bus = createMarker({ lat:  35.323, lng: 33.314 }, "../img/icons/bus.png", mapObj);
    bus.setPosition(mapObj.getCenter());
    mapObj.addListener('click', function(e) {
        animatedMove(bus, 10, bus.position, e.latLng);  
    });
    
}

window.initMap = initMap;