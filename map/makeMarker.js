export function createMarker(marker_position, marker_icon) {
    let marker = new google.maps.Marker({
        position: marker_position,
        map: map,
        icon: marker_icon
    });
    return marker;
}