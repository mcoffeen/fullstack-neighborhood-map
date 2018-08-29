var map;

var markers = [];

//var polygon = null;

//var placeMarkers = [];

var locations = [
    {title: 'Oregon Park', type: 'Disc Golf', location: {lat: 33.9581611, lng: -84.6679743}},
    {title: 'Legacy Park', type: 'Disc Golf', location: {lat: 34.0549463, lng: -84.6358387}},
    {title: 'Kennesaw Mountain', type: 'Hiking', location: {lat: 33.9830771, lng: -84.580117}},
    {title: 'Noses Creek Trail', type: 'Hiking', location: {lat: 33.962692, lng: -84.5953495}},
    {title: 'Park Marina at Lake Allatoona', type: 'Aquatics', location: {lat: 34.1653664, lng: -84.7201781}},
    {title: 'Lake Allatoona Kayaking', type: 'Aquatics', location: {lat: 34.2028009, lng: -84.5911615}}
  ];

//---- ViewModel -----
var viewModel = function() {
  var self = this;

  this.openSideBar = function() {
    document.getElementById("side-bar").className = "col-xs-3";
    document.getElementById("map").className = "col-xs-9";
    document.getElementById("side-bar").style.display = "inline";
    document.getElementById("menuIcon").style.display = "none";
  };

  this.closeSideBar = function() {
  document.getElementById("map").className = "col-xs-12";
  document.getElementById("side-bar").style.display = "none";
  document.getElementById("menuIcon").style.display = "inline";
  };

};


function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 34.0539005, lng: -84.7401179},
    zoom: 10,
    //styles: styles,
    mapTypeControl: false
  });

  var largeInfowindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  };

  showMarkers();
};

// This function will loop through the markers array and display them all.
function showMarkers() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds, 50);
};

  // This function will loop through the listings and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
};

ko.applyBindings( new viewModel() );


