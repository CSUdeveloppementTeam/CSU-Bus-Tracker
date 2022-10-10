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
const bus_marker_icon = "../img/icons/bus_marker.svg";

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
        availableBuses = [];
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
                      animateSelectedMarker(busLocation, 10, null);
                    animateCameraPosition({lat: busLocation.latitude, lng: busLocation.longitude});

                    lastKnownSelectedBusLatLng.latitude = window.mapObj.getCenter().lat();
                    lastKnownSelectedBusLatLng.longitude = window.mapObj.getCenter().lng();
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
        // markers.remove(MarkerId(busLocation.busId));
    }
}

function updateAvailableBusList() {
    availableBuses= [];
    let select_tag = document.querySelector(".bus_selector");
    select_tag.innerHTML = ""; 
    for (let e = 0; e < bufferAvailableBuses.length; e++) {
      availableBuses.push(bufferAvailableBuses[e]);
      let option = document.createElement("option");
      option.style.padding = "5px 17px";
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
    console.log("updating the bus markers");
    if (bus.busId in markers) {
      animateMarker({lat: bus.latitude, lng: bus.longitude}, markers[bus.busId], markers[bus.busId], 10);
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
            let new_camera_lat = bus.latitude;
            let new_camera_lng = bus.longitude;
            
            console.log(new_camera_lat+", " + new_camera_lng);
            animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
            if (!isScreenLocked) {
                isScreenLocked = true;
            }
        }
    }
}

function animateSelectedMarker(
  newBusLocation,
  n
) {
  if (selectedBus != null) {
    if (selectedBus.busId == newBusLocation.busId) {
      if (markers[selectedBus.busId] == null) {
        markers[selectedBus.busId] = createMarker({ lat: selectedBus.latitude, lng: selectedBus.longitude }, bus_marker_icon);
        makeInfowindow(map, markers[selectedBus.busId], selectedBus.busId, selectedBus.busLine);
      }
	    animateMarker({lat: selectedBus.latitude, lng: selectedBus.longitude}, newBusLocation, markers[selectedBus.busId], n);
      if (!window.mapLockStat) {
        setIsScreenLocked(true);
      }
    }
  }
}
function animateMarker (actual, new_position, marker, n) {
	var lat = actual.lat;
  var lng = actual.lng;
  var latlng;
	var deltalat = (new_position.latitude - lat) / 100;
      var deltalng = (new_position.longitude - lng) / 100;

      for (var i = 0; i < 100; i++) {
        (function (ind) {
          setTimeout(
            function () {
              lat = marker.position.lat();
              lng = marker.position.lng();

              lat += deltalat;
              lng += deltalng;
              latlng = new google.maps.LatLng(lat, lng);
              marker.setPosition(latlng);
            }, n * ind);
        })(i)
      }
}

  function animateCameraPosition(position) {
    var lat = window.mapObj.getCenter().lat();
    var lng = window.mapObj.getCenter().lng();

    var deltalat = (position.lat - lat) / 100;
    var deltalng = (position.lng - lng) / 100;
        for (var i = 0; i < 100; i++) {
          (function(ind) {
            setTimeout(
              function() {
                lat = window.mapObj.getCenter().lat();
                lng = window.mapObj.getCenter().lng();
                lat += deltalat;
                lng += deltalng;
                let latlng = new google.maps.LatLng(lat, lng); 
                window.mapObj.setCenter(latlng);
              }, 10 * ind);
          })(i)
        }
  }

  
  

export function deselectBus() {
  console.log("bus deselected");
    if (selectedBus != null) {
      markers[window.selectedBus.busId].setIcon("../img/icons/bus_marker.svg");
      selectedBus = null;
      window.selectedBus = null;
      document.querySelector(".bus_selector").value = null; 
      if (isScreenLocked == true) {
        setIsScreenLocked(false);
      }
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

export function getUserPosition(_callback) {
    if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (p) {
            userPosition = {lat: p.coords.latitude, lng: p.coords.longitude};
            window.userPosition = userPosition;
            _callback(); 
        }, (err) => { console.warn(`ERROR(${err.code}): ${err.message}`); });
    } else {
        console.log("No geolocation available");
    } 
}
export function displayUserPosition() {
  var studentMarker = createMarker(window.userPosition, "../img/icons/student.png");
  window.studentMarker = studentMarker; 
  animateCameraPosition({lat: window.userPosition.lat, lng: window.userPosition.lng});
  window.mapObj.setZoom(15);
}

export function calculateUserAndBusDistance() {
  if (currentSelectedBusPosition != null) {
    let mk1 = selectedBus; 
    let mk2 = window.userPosition;
    console.log("calcul de distance:");
    console.log(mk2);
    var R = 6371.0710; 
    var rlat1 = mk1.latitude * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng - mk1.longitude) * (Math.PI/180); // Radian difference (longitudes)
    
    distanceInMeter = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));  
    return distanceInMeter; 
  } else {
    console.log("For some reason, we can't calculate your distance to the bus ");
    return false; 
  }

}

function clearObject(obj) { obj = {} }
function clearArray(arr) { arr = [] }


export function setSelectedBus(selectedbus) {
    selectedBus = selectedbus;
    // updateCircle(selectedbus);
    let new_camera_lat = selectedBus.latitude;
    let new_camera_lng = selectedBus.longitude;
    console.log("show the selected bus")
    console.log(selectedBus)
    markers[selectedbus.busId].setIcon("../img/icons/selected_bus_marker.svg"); 
    animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
    setIsScreenLocked(true);
    lastKnownSelectedBusLatLng.latitude = selectedbus.latitude;
    lastKnownSelectedBusLatLng.longitude = selectedbus.longitude;
    currentSelectedBusPosition.latitude = selectedbus.latitude;
    currentSelectedBusPosition.longitude = selectedbus.longitude;
    window.selectedBus = selectedBus; 
    // getUserPosition(calculateUserAndBusDistance());
}

export function setInitialBusesMarkers(map) {
    var list = initialBusesLocations;
    let oneBus = [];
    for (let i = 0; i < list.length; i++) {
      oneBus[i] = createMarker({lat:list[i].latitude, lng:list[i].longitude}, bus_marker_icon);
      makeInfowindow(map, oneBus[i], "", "CSU Bus");
    }
    return oneBus; 
    
}