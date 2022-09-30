// student location button function 
export function displayStudentLocation () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
            createMarker({lat: p.coords.latitude, lng: p.coords.longitude}, "student.png");
            map.setCenter({lat: p.coords.latitude, lng: p.coords.longitude});
        }, console.log("the geolocation service failed"));

    } else {
        console.log("No geolocation available");
    }

}