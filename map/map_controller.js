import { onValue, ref } from "firebase/database";
import { makeInfowindow } from "./infowindow.js";
import { createMarker } from "./makeMarker.js";
import { initialBusesLocations } from "./utils.js";

var bufferAvailableBuses = [];
var availableBuses = [];
let selectedBus = null;
let lastKnownSelectedBusLatLng = {};
let currentSelectedBusPosition = {};
const emptyGeoPoint = {
    'latitude': '',
    'longitude': '',
}
var markers = {};
let isScreenLocked = false;
let distanceInMeter;
let userPosition;
const bus_marker_icon = "../img/icons/bus.png";

export function busLocations(db, map) {
    console.log('BusLocations is called');
    onValue(ref(db, 'busLocationsTest'), (snapshot) => {
        var loc = snapshot.val(); 
        handleBusLocations(loc, map)
        console.log(loc);
    },
    (error)=>{
      console.error('BusLocations error: ', error)
    });
}


export function handleBusLocations(locations,map) {
    var buses = [];
    if (Object.keys(locations).length > 0) {
        bufferAvailableBuses = [];
        buses = Object.values(locations);
        console.log(buses);
        buses.forEach((bus) => {
          console.log(bus);
          handlesBusesMarkersUpdate(bus, map);
        } );
        // setSelectedBus(bus);
        updateAvailableBusList();
    } else {
        clearObject(markers);
        deselectBus();
        setInitialBusesMarkers();
        // availableBuses.clear();
        animateCameraPosition(
            35.32524482901032, //back to CSU
            33.344921996725034,
        );
    }
}


function handlesBusesMarkersUpdate(busLocation, map) {
    if (busLocation.presence) {
        bufferAvailableBuses.push(busLocation);
        if (selectedBus !== null) {
          console.log("a bus is selected");
            if (busLocation.busId === selectedBus.busId) {
                if ((lastKnownSelectedBusLatLng.latitude !== busLocation.latitude) &&
                    (lastKnownSelectedBusLatLng.longitude !==
                        busLocation.longitude)) {
                    //   Get.find<MapPageController>().animateMarker(
                    //     from: lastKnownSelectedBusLatLng,
                    //     to: busLocation,
                    //     busId: busLocation.busId,
                    //   );
                      animateSelectedMarker(busLocation.latitude, busLocation.longitude, null, busLocation, 10);
                      let new_camera_lat = busLocation.latitude;
                      let new_camera_lng = busLocation.longitude;
                    animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});

                    lastKnownSelectedBusLatLng.latitude = new_camera_lat;
                    lastKnownSelectedBusLatLng.longitude = new_camera_lng;
                    console.log(lastKnownSelectedBusLatLng)
                    if (currentSelectedBusPosition === null) {
                        currentSelectedBusPosition = emptyGeoPoint;
                    }
                    currentSelectedBusPosition.latitude = busLocation.latitude;
                    currentSelectedBusPosition.longitude = busLocation.longitude;
                    // calculateUserAndBusDistance();
                }
            } else {
              updateBusesMarkers(busLocation);
            }
        } else {
          console.log("no selected bus");
          updateBusesMarkers(map,busLocation);
      }
    } else {
        if (selectedBus.value != null) {
            if (busLocation.busId == selectedBus.busId) {
                deselectBus();
            }
        }
        //TODO: update it javascript
        markers.remove(MarkerId(busLocation.busId));
    }
}

function updateAvailableBusList() {
    availableBuses= [];
    let select_tag = document.querySelector(".bus_selector");
    select_tag.innerHTML = ""; 
    for (let e = 0; e < bufferAvailableBuses.length; e++) {
      availableBuses.push(bufferAvailableBuses[e]);
      let option = document.createElement("option");
      option.innerHTML = bufferAvailableBuses[e].busId + ": " +bufferAvailableBuses[e].busLine; 
      option.value = e;
      select_tag.appendChild(option); 
    }
    
    select_tag.value = "";
    select_tag.setAttribute("placeholder", "Choose a bus");
    window.availableBuses = availableBuses;  
    console.log(availableBuses);
}

function updateBusesMarkers(map, bus) {
    // _markers[MarkerId(bus.busId)] = Marker(
    //   markerId: MarkerId(bus.busId),
    //   position: LatLng(bus.latitude, bus.longitude),
    //   rotation: bus.heading,
    //   zIndex: 2,
    //   flat: true,
    //   anchor: const Offset(0.5, 0.5),
    //   icon: _busIcon,
    //   infoWindow: InfoWindow(
    //     title: bus.busId,
    //     snippet: bus.busLine,
    //   ),
    // );
    console.log("updating the bus markers");
    if (bus.busId in markers) {
      // non selected bus without smooth animation
      markers[bus.busId].setPosition(new google.maps.LatLng(bus.latitude, bus.longitude));
      //non selected bus with smooth animation
      // animatedMarker(bus.latitude, bus.longitude, markers[bus.busId].lat, markers[bus.busId].lng, null, 10, markers[bus.busId]);
    } else {
      markers[bus.busId] = createMarker({lat:bus.latitude, lng:bus.longitude}, bus_marker_icon);
      makeInfowindow(map, markers[bus.busId], bus.busId, bus.busLine);
    }

    if (selectedBus !== null) {
        if (selectedBus.busId == bus.busId) {
            if (currentSelectedBusPosition === null) {
                currentSelectedBusPosition = emptyGeoPoint;
            }
            currentSelectedBusPosition.latitude = bus.latitude;
            currentSelectedBusPosition.longitude = bus.longitude;
            // updateCircle(bus);
            let new_camera_lat = bus.latitude;
            let new_camera_lng = bus.longitude;
            
            console.log(new_camera_lat+", " + new_camera_lng);
            animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
            // if (!isScreenLocked) {
            //     isScreenLocked = true;
            // }
        }
    }
}

function animateSelectedMarker(
   new_lat,
    new_lng,
    rotation,
    bus,
    n
  ) {
    if (selectedBus != null) {
      if (selectedBus.busId == bus.busId) {
        // markers[MarkerId(busId)] = Marker(
        //   markerId: MarkerId(busId),
        //   position: LatLng(latitude, longitude),
        //   rotation: rotation.toDouble(),
        //   zIndex: 2,
        //   flat: true,
        //   anchor: const Offset(0.5, 0.5),
        //   icon: _busIcon,
        //   infoWindow: InfoWindow(
        //     title: selectedBus!.busId,
        //     snippet: selectedBus!.busLine,
        //   ),
        // // ); 

        var lat = selectedBus.latitude;
        var lng = selectedBus.longitude;
        
        animatedMarker (new_lat,
          new_lng, lat, lng,
          rotation,
          bus,
          n, markers[selectedBus.busId])
        // // updateSelectedBusCircle(latitude, longitude);
        // if (!isScreenLocked) {
        //   setIsScreenLocked(true);
        // }
      }
    }
  }

  function animatedMarker (new_lat,
    new_lng,current_lat, current_lng,
    rotation,
    busObj,
    n, busMarker) {
        var deltalat = (new_lat - current_lat) / 100;
        var deltalng = (new_lng - lng) / 100;
      
        for (var i = 0; i < 100; i++) {
          (function(ind) {
            setTimeout(
              function() {
                current_lat = busObj.latitude;
                current_lng = busObj.longitude;
      
                current_lat += deltalat;
                current_lng += deltalng;
                latlng = new google.maps.LatLng(current_lat, current_lng);
                busMarker.setPosition(latlng);
              }, n * ind);
          })(i)
        }
  }

  function animateCameraPosition(position) {
    // _googleMapController.animateCamera(
    //   CameraUpdate.newCameraPosition(
    //     CameraPosition(
    //       //bearing: 192.8334901395799,
    //       target: LatLng(latitude, longitude),
    //       tilt: 0,
    //       zoom: 18.00,
    //     ),
    //   ),
    // );
    window.mapObj.setCenter(position);
  }

  function updateCircle(bus) {
    // circles[const CircleId("selected bus")] = Circle(
    //   circleId: const CircleId("selected bus"),
    //   radius: 20.45, //bus.accuracy,
    //   zIndex: 1,
    //   strokeColor: kdeepBlue,
    //   center: LatLng(bus.latitude, bus.longitude),
    //   fillColor: kdeepBlue.withAlpha(70),
    // );
  }

  function updateSelectedBusCircle({
  latitude,
    longitude,
  }) {
    // circles[const CircleId("selected bus")] = Circle(
    //   circleId: const CircleId("selected bus"),
    //   radius: 20.45, //bus.accuracy,
    //   zIndex: 1,
    //   strokeColor: kdeepBlue,
    //   center: LatLng(latitude, longitude),
    //   fillColor: kdeepBlue.withAlpha(70),
    // );
  }

  function deselectBus() {
    if (selectedBus != null) {
      selectedBus = null;
      if (isScreenLocked == true) {
        setIsScreenLocked(false);
      }
    //   circles.remove(const CircleId('selected bus'));
      currentSelectedBusPosition = null;
      lastKnownSelectedBusLatLng = null;
      // distanceInMeter = null;
    }
  }


export  function setIsScreenLocked(value) {
    isScreenLocked = value;
    window.mapLockStat = isScreenLocked; 
    if (!value) {
      document.querySelector(".lock_panel").remove();
      deselectBus(); 
    } else {
        let lockPanel = document.createElement("div");
        lockPanel.classList.add("lock_panel");
        document.getElementById("map").prepend(lockPanel);
    }
  }

export function getUserPosition() {
  if (userPosition != null) {
    deselectBus();
    // just code the camera movement 
    animateCameraPosition({lat: userPosition.latitude, lng: userPosition.longitude});
  } else {
  //    Get.find<MapPageController>().getUserCurrentPosition(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
            userPosition = {latitude: p.coords.latitude, longitude: p.coords.longitude};
            console.log("position de l'étudiant")
            console.log(userPosition); 
            var studentMarker = createMarker({lat: userPosition.latitude, lng: userPosition.longitude}, "../img/icons/student.png");
            animateCameraPosition({lat: p.coords.latitude, lng: p.coords.longitude});
            console.log(studentMarker);
            window.mapObj.setZoom(15);
            return studentMarker; 
        }, console.log("the geolocation service failed"));
    } else {
        console.log("No geolocation available");
    }
  }
  
  
}

export function calculateUserAndBusDistance() {
  if (currentSelectedBusPosition != null) {
    let mk1 = selectedBus; 
    let mk2 = getUserPosition();
    console.log("calcul de distance:");
    console.log(mk2);
    var R = 6371.0710; 
    var rlat1 = mk1.latitude * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng() - mk1.longitude) * (Math.PI/180); // Radian difference (longitudes)
    
    distanceInMeter = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));    
    return distanceInMeter; 
  } else {
    console.log("For some reason, we can't calculate your distance to the bus ");
    return false; 
  }

}

function clearObject(obj) { obj = {} }
function clearArray(arr) { arr = [] }


export async function setSelectedBus(selectedbus) {
    selectedBus = selectedbus;
    // updateCircle(selectedbus);
    let new_camera_lat = selectedBus.latitude;
    let new_camera_lng = selectedBus.longitude;
    console.log("show the selected bus")
    console.log(selectedBus)
    animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
    setIsScreenLocked(true);
    lastKnownSelectedBusLatLng.latitude = selectedbus.latitude;
    lastKnownSelectedBusLatLng.longitude = selectedbus.longitude;
    currentSelectedBusPosition.latitude = selectedbus.latitude;
    currentSelectedBusPosition.longitude = selectedbus.longitude;
    // calculateUserAndBusDistance();
}

export function setInitialBusesMarkers(map) {
    var list = initialBusesLocations;
    // TODO: change it to javascript
    // for (int i = 0; i < list.length; i++) {
    //   _markers[MarkerId(i.toString())] = Marker(
    //     markerId: MarkerId(i.toString()),
    //     position: list[i],
    //     rotation: 230.0,
    //     zIndex: 2,
    //     flat: true,
    //     anchor: const Offset(0.5, 0.5),
    //     icon: _busIcon,
    //     infoWindow: const InfoWindow(
    //       title: "Csu Bus",
    //     ),
    //   );
    // }

    let oneBus = [];
    for (let i = 0; i < list.length; i++) {
      oneBus[i] = createMarker({lat:list[i].latitude, lng:list[i].longitude}, bus_marker_icon);
      makeInfowindow(map, oneBus[i], "", "CSU Bus");
    }
    return oneBus; 
    
}