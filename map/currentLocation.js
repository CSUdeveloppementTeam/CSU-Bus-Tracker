import { createMarker } from "./makeMarker.js";
export function displayStudentLocation (map) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
            console.log("okay");
            createMarker({lat: p.coords.latitude, lng: p.coords.longitude}, "../img/icons/student.png", map);
            map.setCenter({lat: p.coords.latitude, lng: p.coords.longitude});
            map.setZoom(15);
        }, console.log("the geolocation service failed"));

    } else {
        console.log("No geolocation available");
    }

}