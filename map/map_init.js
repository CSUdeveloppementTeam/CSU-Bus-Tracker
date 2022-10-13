let mapObj;
import { createMarker } from "./makeMarker.js";
import { displayStudentLocation } from "./currentLocation.js";
import { animatedMove } from "./busMovement.js";
import { makeInfowindow } from "./infowindow.js";
import { setInitialBusesMarkers } from "./map_controller.js";
export function initMap() {
    let options = {
        center: { lat:  35.32524482901032, lng: 33.344921996725034 },
        zoom: 18,
        disableDefaultUI: true
    }
    
    mapObj = new google.maps.Map(document.getElementById("map"), options);
    window.mapObj = mapObj; 
    
    // Bus marker maker
    // let bus = createMarker({ lat:  35.323, lng: 33.314 }, "../img/icons/bus.png", mapObj);
    // bus.setPosition(mapObj.getCenter());
    // mapObj.addListener('click', function(e) {
    //     animatedMove(bus, 10, bus.position, e.latLng);  
    // });
    setInitialBusesMarkers(mapObj);
    
    // Infowindow maker
    // makeInfowindow(mapObj, bus, "Bus 1", "Nusmar Market"); 
}