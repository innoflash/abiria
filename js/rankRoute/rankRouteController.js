define(["app", "js/rankRoute/rankRouteView"], function (app, View) {
  var $ = jQuery;
  var $$ = Dom7;
  var position = -1;
  var data = {};
  var route = {};
  var directionsService, directionsDisplay, currentPosition = null;
  var positionMarker, map, pedestrianIcon, watchID = null;
  var origin, destination, rankname, user, routeResult = null;

  var bindings = [
    {
      element: '#openDetails',
      event: 'click',
      handler: openOptions
    }
  ];

  function openOptions() {
    myOptions = app.f7.actions.create({
      buttons: [
        // First group
        [
          {
            text: 'Journey Options',
            label: true
          },
          {
            text: 'Start journey',
            bold: true,
            onClick: function () {
              startJourney();
            }
          },
          {
            text: 'Details',
            bold: true,
            onClick: function () {
              openDetails();
            }
          }
        ],
        // Second group
        [
          {
            text: 'Cancel',
            color: 'red'
          }
        ]
      ]
    });
    myOptions.open();
  }

  function startJourney() {
    var currentPosition = new google.maps.LatLng(maps.makeCoords(origin));
    map.setZoom(18);
    map.setCenter(currentPosition);
    positionMarker = new google.maps.Marker({
      position: currentPosition,
      map: map,
      title: "current position",
      animation: google.maps.Animation.DROP,
      icon: pedestrianIcon
    });
    refreshPosition();
    updateCompass()
  }

  function refreshPosition() {
    watchID = navigator.geolocation.watchPosition(locationSuccess.bind(this), locationError.bind(this), {
      maximumAge: 3000,
      timeout: 7000,
      enableHighAccuracy: true
    });
  }

  function locationSuccess(position) {
    currentPosition = position
    var waitForIt = false
    console.log('position success called')
    console.log(position);
    var newPosition = new google.maps.LatLng({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    map.setZoom(18);
    map.setCenter(newPosition);
    positionMarker.setPosition(newPosition);
    updateHeading(newPosition);
    positionRefresh.updateSpeed(position, 'WALKING')
  }

  function updateCompass() {
    updateID = setInterval(function(){
      console.log('running an interval refresh')
      if (currentPosition != null) {
        doCompassUpdate(currentPosition)
      }
    }, appDigits.posUpdate)
  }

  function doCompassUpdate(position) {
  //  navigator.geolocation.clearWatch(watchID);
    positionRefresh.calculateRoute(position, destination, directionsService, 'WALKING').then((result, status) => {
      if (result === null) {
        console.log('do compass update')
      }else{
        positionRefresh.updateDirection(result)
      }
      console.log('result found:', result)
    }).catch(err => console.log(err)).finally(()=> {
//      refreshPosition()
    })
  }

  function locationError(error) {
    console.log(error);
    app.f7.toast.create({
      text: messages.location_error,
      closeTimeout: 2000
    }).open();
    refreshPosition();
  }

  function openDetails() {
    app.f7.dialog.alert('Your route to ' + rankname +
    ' via ' + routeResult.routes[0].summary +
    ' is estimated to be ' + routeResult.routes[0].legs[0].distance.text +
    ' and will probably take you ' + routeResult.routes[0].legs[0].duration.text, 'Hi ' + user.first_name);
  }

  function preparePage() {
    $('#speedometer').hide();
    pedestrianIcon = 'img/icons/pedestrian.png';
    origin = app.mainView.router.currentRoute.params.origin;
    destination = app.mainView.router.currentRoute.params.destination;
    rankname = app.mainView.router.currentRoute.params.rankname;
    user = Cookies.getJSON(cookienames.user);
    data = JSON.parse(localStorage.getItem(cookienames.rankRoutes));
    loadMap();
    console.log(origin, destination);
    window.plugins.insomnia.keepAwake()
  }

  function loadMap() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    var map = new GoogleMap(maps.makeCoords(origin), maps.makeCoords(destination));
    map.initialize();
    updateHeading(maps.makeCoords(origin));
  }

  function updateHeading(currentPosition) {
    console.log(currentPosition);
    console.log(maps.makeCoords(destination));
    var heading = google.maps.geometry.spherical.computeHeading(currentPosition, maps.makeCoords(destination));
    console.log(heading);
    map.setHeading(heading);
  }

  function GoogleMap(origin, destination) {
    mapDiv = $('#rank_mapova');
    this.initialize = function () {
      map = showMap();
    };

    var showMap = function () {
      console.log(maps.getMidPoint(origin, destination));
      var mapOptions = {
        zoom: 21,
        center: maps.getMidPoint(origin, destination),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        tilt: 45,
        styles: mapStyles,
        disableDefaultUI: true
      };

      var map = new google.maps.Map(document.getElementById("rank_mapova"), mapOptions);
      directionsDisplay.setMap(map);
      calcRoute(directionsService, directionsDisplay, origin, destination);
      return map;
    };
  }


  function calcRoute(directionsService, directionsDisplay, origin, destination) {
    var request = {
      origin: origin,
      destination: destination,
      travelMode: 'WALKING'
    };
    directionsService.route(request, function (result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
        routeResult = result;
        openDetails();
      }
      console.log(result);
      console.log(status);
    });
  }

  function init() {
    preparePage();
    View.render({
      bindings: bindings
    });
  }

  function reinit() {
    console.log('reinitialising');
  }

  function onOut() {
    window.plugins.insomnia.allowSleepAgain()
    try {
      navigator.geolocation.clearWatch(watchID);
      clearInterval(updateID)
    } catch (e) {
    }
    console.log('rankRoute outting');
  }

  return {
    init: init,
    onOut: onOut,
    reinit: reinit
  };
});
