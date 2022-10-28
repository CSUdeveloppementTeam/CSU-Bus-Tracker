let mapObj;
import { setInitialBusesMarkers } from "./map_controller.js";
export function initMap() {
    let options = {
        center: { lat:  35.32524482901032, lng: 33.344921996725034 },
        zoom: 18,
        disableDefaultUI: true
    }
    
    mapObj = new google.maps.Map(document.getElementById("map"), options);
    window.mapObj = mapObj; 
    
    setInitialBusesMarkers(mapObj);
}