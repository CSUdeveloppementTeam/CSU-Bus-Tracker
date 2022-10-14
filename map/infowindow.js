export function makeInfowindow (map,event_target, title, text) {
    let infowindow = new google.maps.InfoWindow({
        content:'<h1>'+title+'</h1><p>'+text+'</p>'
    });

    event_target.addListener("click", function () {
        infowindow.open(map, event_target);
    });
}