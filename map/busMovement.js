export function animatedMove(marker, n, current, moveto) {
    var lat = current.lat();
    var lng = current.lng();
    var latlng; 
    

    var deltalat = (moveto.lat() - current.lat()) / 100;
    var deltalng = (moveto.lng() - current.lng()) / 100;
  
    for (var i = 0; i < 100; i++) {
      (function(ind) {
        setTimeout(
          function() {
            lat = marker.position.lat();
            lng = marker.position.lng();
  
            lat += deltalat;
            lng += deltalng;
            latlng = new google.maps.LatLng(lat, lng);
            marker.setPosition(latlng);
          }, n * ind
        );
      })(i)
    }
  }
