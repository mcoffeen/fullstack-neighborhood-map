// ----- Model -----

var map;

var markers = [];

var allTypes = [];

var locations = [
    {
      title: 'Oregon Park',
      type: 'Disc Golf',
      location: {lat: 33.9581611, lng: -84.6679743}
    },
    {
      title: 'Legacy Park',
      type: 'Disc Golf',
      location: {lat: 34.0549463, lng: -84.6358387}
    },
    {
      title: 'Kennesaw Mountain',
      type: 'Hiking',
      location: {lat: 33.9830771, lng: -84.580117}
    },
    {
      title: 'Noses Creek Trail',
      type: 'Hiking',
      location: {lat: 33.962692, lng: -84.5953495}
    },
    {
      title: 'Park Marina at Lake Allatoona',
      type: 'Aquatics',
      location: {lat: 34.1653664, lng: -84.7201781}
    },
    {
      title: 'Lake Allatoona Kayaking',
      type: 'Aquatics',
      location: {lat: 34.2028009, lng: -84.5911615}
    }
  ];

var Location = function(data) {
  this.title = ko.observable(data.title);
  this.type = ko.observable(data.type);
  this.location = ko.observable(data.location);
};


//---- ViewModel -----

var viewModel = function() {
  var self = this;

  this.locationList = ko.observableArray([]);

  locations.forEach(function(locationItem){
    self.locationList.push( new Location(locationItem) );
  });

  this.selectedType = ko.observable();

  this.selectedTypeChanged = function() {
    if ( self.selectedType() ) {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].type != self.selectedType()) {
          //markers[i].infowindow.close();
          markers[i].setMap(null);
        } else {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
          }
      };
      map.fitBounds(bounds, 50);

      // restores locationList to original locations
      this.locationList([]);
      locations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem) );
      });

      // iterate backwards through locationList to remove any locations that
      // don't match the type of the selectedLocation.  Must iterate backwards
      // to avoid the array being re-indexed when using the splice() method.
      var i = self.locationList().length
      while (i--) {
        if (self.locationList()[i].type() != self.selectedType()) {
          //console.log( self.locationList()[i].title() + ' has been removed.');
          self.locationList.splice( i, 1);
        };
      };
    } else { this.showAllLocations();
    };
  };

  // This function will loop through the locations array and display them all.
  this.showAllLocations = function() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
      markers[i].infowindow.close();
    }
    map.fitBounds(bounds, 50);

    this.selectedType('');

    // restores locationList to original locations
    this.locationList([]);
    locations.forEach(function(locationItem){
      self.locationList.push( new Location(locationItem) );
    });
  };

  // This function will hide all markers and remove all
  // locations from locationList
  this.hideAllLocations = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].infowindow.close();
      markers[i].setMap(null);
    };
    this.locationList([]);
    this.selectedType('');
  };

  //create an array of each unique activity type
  this.uniqueTypes = ko.observableArray([]);
  allTypes = self.locationList().map(a => a.type());
  allTypes.unshift('');

  function onlyUnique (value, index, self) {
    return self.indexOf(value) === index;
  };

  this.uniqueTypes( allTypes.filter( onlyUnique ));

  self.toggleBounce = function(location) {
    //console.log(location.title());
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].title != location.title()) {
        markers[i].setAnimation(null);
        markers[i].infowindow.close();
      } else {
        markers[i].setAnimation(google.maps.Animation.BOUNCE);
        var ll = location.location().lat + ',' + location.location().lng;
        populateInfoWindow(markers[i], markers[i].infowindow, ll);
      }
    };
  };

  this.openSideBar = function() {
    document.getElementById("side-bar").style.width = "320px";
  };

  this.closeSideBar = function() {
    document.getElementById("side-bar").style.width = "0";
  };

};

// ----- Google Maps API -------

function initMap() {
  mapOptions = {
    center: {lat: 34.0539005, lng: -84.7401179},
    zoom: 11,
    //styles: styles,
    mapTypeControl: false
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var bounds = new google.maps.LatLngBounds();

  // create an array of markers using the locations array
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var type = locations[i].type;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      type: type,
      animation: google.maps.Animation.DROP,
      id: i
    });
    marker.infowindow = new google.maps.InfoWindow();
    // Push the marker to our array of markers.
    markers.push(marker);
    // Add the marker to the map
    marker.setMap(map);
    bounds.extend(markers[i].position);

    // Create an onclick event to open the infowindow at each marker.
    marker.addListener('click', function() {
      var ll = this.position.lat() + ',' + this.position.lng();
      populateInfoWindow(this, marker.infowindow, ll);
      toggleBounce(this);
    });

  };

  map.fitBounds(bounds, 50);

};

function gMapsError() {
  alert('Google Maps did not load.  Try refreshing the page.');
}

function toggleBounce(marker) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setAnimation(null);
  };
  marker.setAnimation(google.maps.Animation.BOUNCE);
};


function populateInfoWindow(marker, infowindow, ll) {
  // close all infowindows first
  for (var i = 0; i < markers.length; i++) {
    markers[i].infowindow.close();
  };

  // get Foursquare data for most popular food venue nearby
  var fourSquareURL = 'https://api.foursquare.com/v2/venues/explore';
  var CLIENT_ID = 'RJNK1JRB4UMBBKD1O4QR23EJVNZAUAGHAUYCLMHPMW5IOR2B';
  var CLIENT_SECRET = 'FFC5V4DRBETPVC4ZMLWZW2AGT3XCW0RZY3OUED1LHBPPLYUT';

  //console.log('Location passed to Foursquare: ' + ll);

  $.ajax({
    url: fourSquareURL,
    dataType: 'json',
    data: 'v=20180916' + '&ll=' + ll + '&section=food&limit=10&time=any' +
      '&day=any&client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET,
    async: true,

    success: function (data) {
      var foodName = data.response.groups[0].items[0].venue.name;
      // if address for location is undefined show lat/lon
      if (data.response.groups[0].items[0].venue.location.address
        == undefined) {
        var foodAddress = data.response.groups[0].items[0].venue.location.lat +
          ", " + data.response.groups[0].items[0].venue.location.lng;
        } else {
          var foodAddress =
            data.response.groups[0].items[0].venue.location.address;
        }

      // set the content of the infoWindow
      infowindow.setContent('<div><h4>' + marker.title + '</h4><h6>' +
        marker.type + '<hr><h6>Top Food Location Nearby:</h6>' + foodName +
        '<br>' + foodAddress +
        '<br><br><img src="img/powered-by-foursquare-grey.png"></div>');
    },

    error: function(error) {
      alert('Error received from Foursquare');
    }
  });

  // open infowindow for clicked marker
  infowindow.marker= marker;
  infowindow.open(map, marker);
};

ko.applyBindings( new viewModel() );


