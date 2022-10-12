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
    buses.forEach((bus) => {
          console.log(bus);
      handlesBusesMarkersUpdate(bus, map);
    });
    updateAvailableBusList();
  } else {
    markers = {};
    deselectBus();
    setInitialBusesMarkers();
    availableBuses = [];
    animateCameraPosition({ lat: 35.32524482901032, lng: 33.344921996725034 });//back to CSU
  }
}


function handlesBusesMarkersUpdate(busLocation, map) {
  if (busLocation.presence) {
    bufferAvailableBuses.push(busLocation);
        if (selectedBus !== null) {
      console.log("a bus is selected");
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
          // console.log(lastKnownSelectedBusLatLng)
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
  }
}

function updateAvailableBusList() {
  let previousAvailableBuses = availableBuses; 
  availableBuses= [];
  let select_tag = document.querySelector(".bus_selector");
  // select_tag.innerHTML = ""; 

  // remove an disapeared bus 
  previousAvailableBuses.forEach((item) => {
    let disapeared = true;  
    for (let x = 0; x < bufferAvailableBuses.length; x++) {
      if (item.busId == bufferAvailableBuses[x].busId) {
        console.log("didn't disapeared");
        disapeared = false;
      }
      if (disapeared == true) {
        console.log(" disapeared");
        document.querySelector([id=item.busId]).remove();
        markers[item.busId].setMap(null);
      }
    }
    console.log("check desapeared");
  })
  // update and add bus 
  for (let e = 0; e < bufferAvailableBuses.length; e++) {
    if (bufferAvailableBuses[e].presence)  {
        console.log("this bus is present")
        availableBuses.push(bufferAvailableBuses[e]);
      let wasPresent = false; 
      for (let i = 0; i < previousAvailableBuses.length; i++) {
        if (bufferAvailableBuses[e].busId == previousAvailableBuses[i].busId) {
          console.log('was already there');
          wasPresent = true; 
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
        console.log('was not there ');
      }
    } else {
      console.log('this bus is absent');
      document.querySelector([id=bufferAvailableBuses.busId]).remove();
      markers[bufferAvailableBuses.busId].setMap(null);
    } 
  }
  
  if (selectedBus == null) {
    select_tag.value = "";
  } 
  window.availableBuses = availableBuses;  
}

function updateBusesMarkers(map, bus) {
  console.log("updating the bus markers");
  if (bus.busId in markers) {
    console.log("unselected marker move");
    animateMarker(bus, markers[bus.busId], markers[bus.busId], 10);
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

      // var lat = selectedBus.latitude;
      // var lng = selectedBus.longitude;
      // var latlng;
      if (markers[selectedBus.busId] == null) {
        markers[selectedBus.busId] = createMarker({ lat: selectedBus.latitude, lng: selectedBus.longitude }, bus_marker_icon);
        makeInfowindow(map, markers[selectedBus.busId], selectedBus.busId, selectedBus.busLine);
      }
      markers[selectedBus.busId].setPosition(new google.maps.LatLng(newBusLocation.latitude, newBusLocation.longitude));
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
  console.log("moving unselected function")
	// var lat = actual.lat;
  // var lng = actual.lng;
  // var latlng;
  var lat = new_position.position.lat();
  var lng = new_position.position.lng();
  var latlng = new google.maps.LatLng(lat, lng);
  console.log(actual);
  console.log(markers[actual.busId]);
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
  console.log("bus deselected");
  if (selectedBus != null) {
    markers[selectedBus.busId].setIcon("../img/icons/bus_marker.svg");
    selectedBus = null;
    selectedBus = null;
    document.querySelector(".bus_selector").value = null; 
    if (isScreenLocked == true) {
      setIsScreenLocked(false);
    }
  //   currentSelectedBusPosition = null;
  //   lastKnownSelectedBusLatLng = null;
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

export function getUserPosition(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (p) {
        userPosition = { lat: p.coords.latitude, lng: p.coords.longitude };
        console.log("position de l'étudiant")
        console.log(userPosition);
        window.userPosition = userPosition;
        callback(); 
      }, console.log("the geolocation service failed"));
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
    console.log("ardi's distance: " +distanceInMeter);
    return distanceInMeter;
  } else {
    console.log("For some reason, we can't calculate your distance to the bus ");
    return false;
  }

}


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