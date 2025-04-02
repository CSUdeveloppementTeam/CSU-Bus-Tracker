import { onValue, ref } from "firebase/database";
import { makeInfowindow } from "./infowindow.js";
import { createMarker } from "./makeMarker.js";
import { initialBusesLocations } from "./utils.js";

var bufferAvailableBuses = [];
var availableBuses = [];
let selectedBus = null;
window.selectedBus = null;
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
  onValue(ref(db, 'busLocations'), (snapshot) => {
    var loc = snapshot.val();
    if (loc != null && typeof loc !== undefined) {
      handleBusLocations(loc, map); 
    }
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
    buses.forEach((bus) => {
      handlesBusesMarkersUpdate(bus, map);
    });
    updateAvailableBusList();
  } else {
    markers = {};
    deselectBus();
    availableBuses = [];
    animateCameraPosition({ lat: 35.32524482901032, lng: 33.344921996725034 });//back to CSU
  }
}


function handlesBusesMarkersUpdate(busLocation, map) {
  if (busLocation.presence ) {
    bufferAvailableBuses.push(busLocation);
    if (selectedBus !== null) {
      if (busLocation.busId === selectedBus.busId) {
        if ((selectedBus.latitude !== busLocation.latitude) &&
          (selectedBus.longitude !==
            busLocation.longitude)) {
          animateSelectedMarker(busLocation, 5);
          let new_camera_lat = busLocation.latitude;
          let new_camera_lng = busLocation.longitude;
          animateCameraPosition({ lat: new_camera_lat, lng: new_camera_lng });

          lastKnownSelectedBusLatLng.latitude = new_camera_lat;
          lastKnownSelectedBusLatLng.longitude = new_camera_lng;
          if (currentSelectedBusPosition === null) {
            currentSelectedBusPosition = emptyGeoPoint;
          }
          currentSelectedBusPosition.latitude = busLocation.latitude;
          currentSelectedBusPosition.longitude = busLocation.longitude;
          // calculateUserAndBusDistance();
        }
      } else {
        updateBusesMarkers(map, busLocation);
      }
    } else {
      updateBusesMarkers(map, busLocation);
    }
  } else {
    if (selectedBus != null) {
      if (busLocation.busId == selectedBus.busId) {
        deselectBus();
      }
    }
    //TODO: update it javascript
    // markers.remove(MarkerId(busLocation.busId));
    if (window.markers[busLocation.busId] != null) {
      window.markers[busLocation.busId].setMap(null);  
    }
    if (document.getElementById(busLocation.busId) != null && typeof document.getElementById(busLocation.busId) !== undefined) {
      document.getElementById(busLocation.busId).remove();
    }
    window.markers[busLocation.busId] = null;
  }
  busLocation = null; 
}

function updateAvailableBusList() {
  let previousAvailableBuses = availableBuses; 
  availableBuses= [];
  let select_tag = document.querySelector(".bus_selector");

  // update and add bus 
  for (let e = 0; e < bufferAvailableBuses.length; e++) {
      availableBuses.push(bufferAvailableBuses[e]);
      let wasPresent = false; 
      for (let i = 0; i < previousAvailableBuses.length; i++) {
        if (bufferAvailableBuses[e].busId == previousAvailableBuses[i].busId) {
          wasPresent = true;
          if (bufferAvailableBuses[e].busLine != previousAvailableBuses[i].busLine) {
            document.getElementById(bufferAvailableBuses[e].busId).innerHTML = bufferAvailableBuses[e].busId + ": " +bufferAvailableBuses[e].busLine;
          } 
          break; 
        }
      }
      if (wasPresent == false) {
        let option = document.createElement("option");
        option.id = bufferAvailableBuses[e].busId;
        option.style.padding = "5px 17px";
        option.innerHTML = bufferAvailableBuses[e].busId + ": " +bufferAvailableBuses[e].busLine; 
        option.value = bufferAvailableBuses[e].busId;
        select_tag.appendChild(option); 
      }
      updateTopBarMsg();
  }
  
  if (selectedBus == null) {
    select_tag.value = "";
  } 
  window.availableBuses = availableBuses; 

}

function updateBusesMarkers(map, bus) {

  if (markers[bus.busId] != null) { 
    // animateMarker(bus, markers[bus.busId], markers[bus.busId], 10);
    markers[bus.busId].setPosition({lat:bus.latitude, lng: bus.longitude});
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
          
          animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
          if (!isScreenLocked) {
              setIsScreenLocked(true);
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

      // var lat = selectedBus.latitude;
      // var lng = selectedBus.longitude;
      // var latlng;
      if (markers[selectedBus.busId] == null) {
        markers[selectedBus.busId] = createMarker({ lat: selectedBus.latitude, lng: selectedBus.longitude }, bus_marker_icon);
        makeInfowindow(map, markers[selectedBus.busId], selectedBus.busId, selectedBus.busLine);
      }
      markers[selectedBus.busId].setPosition(new google.maps.LatLng(newBusLocation.latitude, newBusLocation.longitude));
      //update the distance
      if (window.userPosition != null || typeof window.userPosition  != "undefined") {
        let distance = Math.round(calculateUserAndBusDistance());
        if (distance == false) {
          document.getElementById("distance_display").innerHTML = ""; 
        } else {
        document.getElementById("distance_display").innerHTML = distance + "m"; 
        } 
      }
      // var deltalat = (newBusLocation.latitude - lat) / 100;
      // var deltalng = (newBusLocation.longitude - lng) / 100;

      // for (var i = 0; i < 100; i++) {
      //   (function (ind) {
      //     setTimeout(
      //       function () {
      //         lat = markers[selectedBus.busId].position.lat();
      //         lng = markers[selectedBus.busId].position.lng();

      //         lat += deltalat;
      //         lng += deltalng;
      //         latlng = new google.maps.LatLng(lat, lng);
      //         markers[selectedBus.busId].setPosition(latlng);
      //       }, n * ind);
      //   })(i)
      // }
      window.updateD(); 
      if (!isScreenLocked) {
        setIsScreenLocked(true);
      }
    }
  }
}

function animateMarker (actual, new_position, marker, n) {
	// var lat = actual.lat;
  // var lng = actual.lng;
  // var latlng;
  var lat = new_position.position.lat();
  var lng = new_position.position.lng();
  var latlng = new google.maps.LatLng(lat, lng);
  window.markers[actual.busId].setPosition(latlng);

	// var deltalat = (new_position.latitude - lat) / 100;
  //     var deltalng = (new_position.longitude - lng) / 100;

  //     for (var i = 0; i < 100; i++) {
  //       (function (ind) {
  //         setTimeout(
  //           function () {
  //             lat = marker.position.lat();
  //             lng = marker.position.lng();

  //             lat += deltalat;
  //             lng += deltalng;
  //             latlng = new google.maps.LatLng(lat, lng);
  //             marker.setPosition(latlng);
  //           }, n * ind);
  //       })(i)
  //     }
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
            }, 5 * ind);
        })(i)
      }
}



export function deselectBus() {
  if (selectedBus != null) {
    markers[selectedBus.busId].setIcon("../img/icons/bus_marker.svg");
    selectedBus = null;
    document.querySelector(".bus_selector").value = "msg"; 
    if (isScreenLocked == true) {
      setIsScreenLocked(false);
    }
    document.getElementById("distance_display").innerHTML = "";
    updateTopBarMsg();
  //   currentSelectedBusPosition = null;
  //   lastKnownSelectedBusLatLng = null;
    // distanceInMeter = null;
  }
}

export  function setIsScreenLocked(value) {
  isScreenLocked = value;
  window.mapLockStat = isScreenLocked; 
  const lock_icon = document.querySelector('#lock_unlock img');
  const lock_btn = document.querySelector('#lock_unlock');
  if (!value) {
    document.querySelector(".lock_panel").remove();
    deselectBus(); 
    lock_btn.classList.remove("active"); 
    lock_icon.src = "img/icons/lock_unlock_icon.png";
  } else {
    let lockPanel = document.createElement("div");
    lockPanel.classList.add("lock_panel");
    document.getElementById("map").prepend(lockPanel);
    lock_icon.src = "img/icons/lock_icon.png";
      lock_btn.classList.add("active"); 
  }
}

export function getUserPosition(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (p) {
        userPosition = { lat: p.coords.latitude, lng: p.coords.longitude };
        window.userPosition = userPosition;
        callback(); 
      });
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
    let mk1 = window.selectedBus;
    let mk2 = window.userPosition;
    var R = 6378137.0;
    var rlat1 = mk1.latitude * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng - mk1.longitude) * (Math.PI/180); // Radian difference (longitudes)
    distanceInMeter = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return distanceInMeter;
  } else {
    return false;
  }

}


export function setSelectedBus(selectedbus) {
  selectedBus = selectedbus;
  // updateCircle(selectedbus);
    let new_camera_lat = selectedBus.latitude;
    let new_camera_lng = selectedBus.longitude;
    markers[selectedbus.busId].setIcon("../img/icons/selected_bus_marker.svg"); 
    animateCameraPosition({lat: new_camera_lat, lng: new_camera_lng});
  setIsScreenLocked(true);
  window.selectedBus = selectedBus; 
  // calculateUserAndBusDistance();
}

export function setInitialBusesMarkers(map) {
  var list = initialBusesLocations;
  let oneBus = [];
  for (let i = 0; i < list.length; i++) {
    oneBus[i] = createMarker({ lat: list[i].latitude, lng: list[i].longitude }, bus_marker_icon);
    makeInfowindow(map, oneBus[i], "", "CSU Bus");
  }
  return oneBus;

}
window.markers = markers; 

export function updateTopBarMsg () {
  if (markers !=  null || typeof markers != "undefined") {
    // console.log("there is a bus"); 
    if (selectedBus == null || typeof selectedBus == "undefined") {
      document.querySelector('.top-bar-message').innerHTML = "Choose a bus"; 
      document.querySelector(".bus_selector").value = "msg"; 
    } 
  } else {
    // console.log("there is a no bus"); 
    document.querySelector('.top-bar-message').innerHTML = "No bus available";
    document.querySelector(".bus_selector").value = "msg";
  }
}