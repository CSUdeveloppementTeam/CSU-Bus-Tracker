function getRotation(start, end) {
    var latDif = Math.abs(start.latitude - end.latitude); 
    var lngDif = Math.abs(start.longitude - end.longitude); 
    var rotation = -1;

    if (start.latitude < end.latitude && start.longitude < end.longitude) { 
        rotation = parseFloat(radsToDegrees(Math.atan(lngDif / latDif)));
    } else if (start.latitude >= end.latitude &&
        start.longitude < end.longitude) {
        rotation = parseFloat((90 - radsToDegrees(Math.atan(lngDif / latDif)) + 90));
    } else if (start.latitude >= end.latitude &&
        start.longitude >= end.longitude) { 
        rotation = parseFloat((radsToDegrees(Math.atan(lngDif / latDif)) + 180));
    } else if (start.latitude < end.latitude &&
        start.longitude >= end.longitude) {
        rotation = parseFloat((90 - radsToDegrees(Math.atan(lngDif / latDif)) + 270));
    }
    console.log(rotation);
    return rotation;
}

function radsToDegrees(rad) {
    return (rad*180.0) / Math.PI;
}

getRotation({latitude: 35.324672507463525, longitude: 33.344777159186954},
    {latitude: 35.3247512893327, longitude: 33.34465377781159});
