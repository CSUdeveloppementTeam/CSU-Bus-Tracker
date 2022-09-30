import { displayStudentLocation } from "./currentLocation";
import { createMarker } from "./makeMarker.js";
import { animatedMove } from "./busMovement";
let map;
function initMap() {
    let options = {
        center: { lat:  35.323, lng: 33.314 },
        zoom: 15,
    }
    
    map = new google.maps.Map(document.getElementById("map"), options);
    
    let check = document.getElementById("btn").addEventListener("click", function (e) {
        displayStudentLocation();
    })
  
    let bus = createMarker({ lat:  35.323, lng: 33.314 }, "bus.png");
    bus.setPosition(map.getCenter());
    map.addListener('click', function(e) {
        animatedMove(bus, 10, bus.position, e.latLng);  
      });
    
}
window.initMap = initMap;