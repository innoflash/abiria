define(["app", "js/drive/driveView"], function (app, View) {
  var $ = jQuery;
  var $$ = Dom7;
  var user = {};
  var car = {};
  var position, posUpdateCount = 0;
  var data = {};
  var route = {};
  var polyLine = {};
  var tollgates = {};
  var j_id = 0;
  var initialCoords = {};
  var selectedToll = {};
  var tollPopup = {};
  var positionMarker, currentPosition = null;
  var updatePosition = true;
  var mapDiv;
  var map = null;
  var directionsService, directionsDisplay, startLat, startLng = null;
  var meIcon, tollgateIcon, routeGate, watchID = null;

  var bindings = [
    {
      element: '#driveOptions',
      event: 'click',
      handler: driveOptions
    }
  ];

  function driveOptions() {
    myOptions = app.f7.actions.create({
      buttons: [
        // First group
        [
          {
            text: 'Drive Options',
            label: true
          },
          {
            text: 'Start / End Journey',
            bold: true,
            onClick: function () {
              toggleJourney();
            }
          },
          {
            text: 'Cancel Journey',
            bold: true,
            onClick: function () {
              cancelJourney();
            }
          },
          {
            text: 'Tollgates updates',
            bold: true,
            onClick: function () {
              tollUpdates();
            }
          },
          {
            text: 'Fuel Consumption',
            bold: true,
            onClick: function () {
              fuelConsumption();
            }
          },
          {
            text: 'Details',
            bold: true,
            onClick: function () {
              app.mainView.router.navigate({
                url: '/routedetails/' + position,
                reloadPrevious: false
              });
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

  function cancelJourney() {
    if (j_id == 0) {
      app.f7.dialog.alert('You cant cancel a journey you didn`t start');
    } else {
      app.f7.dialog.confirm('Are you sure you want to cancel this journey?', function () {
        alterJourney('Cancelling journey', 2);
      });
    }

  }

  function tollUpdates() {
    console.log('will get toll gates according to the current position relative to destination');
    if (functions.hasCookie(cookienames.has_tollgates) == false || functions.hasCookie(cookienames.has_tollgates) == 'false') {
      getTollgates();
    } else {
      calculateTollgates();
    }
  }

  function toggleJourney() {
    console.log(map);
    var data = {
      driver_id: user.id,
      car_id: car.id,
      from: route.legs[0].start_address,
      from_coords: route.legs[0].start_location.lat + ',' + route.legs[0].start_location.lng,
      to: route.legs[0].end_address,
      to_coords: route.legs[0].end_location.lat + ',' + route.legs[0].end_location.lng,
      route: JSON.stringify(route),
      duration: route.legs[0].duration.text,
      distance: route.legs[0].distance.text,
      email: user.email,
      phone: user.phone
    };
    if (j_id == 0) {
      app.f7.dialog.preloader('Starting journey');
      $.ajax({
        url: api.getPath('makejourney'),
        method: 'POST',
        timeout: appDigits.timeout,
        data: data
      }).success(function (data) {
        positionMarker = new google.maps.Marker({
          position: new google.maps.LatLng({
            lat: startLat,
            lng: startLng
          }),
          animation: google.maps.Animation.DROP,
          draggable: false,
          map: map,
          title: 'Me',
          icon: meIcon
        });

        j_id = data.j_id;
        //refreshPosition();
        reloadPosition(true);
        updateCompass()
        Cookies.set(cookienames.journey_started, true);
        Cookies.set(cookienames.journey_id, data.j_id);
        Cookies.set(cookienames.position, position);

        map.setZoom(18);
        map.setCenter(new google.maps.LatLng({
          lat: startLat,
          lng: startLng
        }));

        app.f7.toast.create({
          text: 'Your journey has been started...',
          closeTimeout: 2000,
        }).open();
        var notification = app.f7.notification.create({
          icon: '<i class="f7-icons">chat</i>',
          subtitle: 'Journey alert !!!',
          text: data.message,
          closeOnClick: true,
          titleRightText: 'now'
        });
        notification.open();
      }).error(function (error) {
        console.log(error);
        app.f7.dialog.alert(messages.server_error);
      }).always(function () {
        app.f7.dialog.close();
      });
    } else {
      app.f7.dialog.confirm('Are you done with this journey?', function () {
        alterJourney('Finishing journey', 1);
      });
    }
  }

  function alterJourney(statement, state) {
    app.f7.dialog.preloader(statement);
    $.ajax({
      url: api.getPath('updatejourney'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        j_id: j_id,
        state: state,
        driver_id: user.id,
        email: user.email,
        phone: user.phone
      }
    }).success(function (data) {
      console.log(data);
      app.f7.dialog.alert(data.message, function () {
        if (data.success) {
          Cookies.set(cookienames.journey_started, false);
          Cookies.set(cookienames.journey_id, 0);
          Cookies.remove(cookienames.journey_id);
          Cookies.remove(cookienames.journey_started);
          j_id = 0;
          app.mainView.router.back('/index');
        }
      });
    }).error(function (error) {
      console.log(error);
      app.f7.dialog.alert(messages.server_error);
    }).always(function () {
      app.f7.dialog.close();
    });
  }

  function reloadPosition(state) {
    if (positionMarker == null) {
      positionMarker = new google.maps.Marker({
        position: new google.maps.LatLng({
          lat: startLat,
          lng: startLng
        }),
        animation: google.maps.Animation.DROP,
        draggable: false,
        map: map,
        title: 'Me',
        icon: meIcon
      });
    }
    if (updatePosition) {
      watchID = navigator.geolocation.watchPosition(watchSuccess.bind(this), locationError.bind(this), {
        maximumAge: 3000,
        timeout: 7000,
        enableHighAccuracy: true
      });
    }

  }

  function watchSuccess(position) {
    console.log(position);
    currentPosition = position;
    var newPosition = new google.maps.LatLng({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    map.setZoom(18);
    map.setTilt(15);
    map.setCenter(newPosition);
    positionMarker.setPosition(newPosition);
    positionRefresh.updateSpeed(position)
  }

  function locationError(error) {
    console.log(error);
    app.f7.toast.create({
      text: messages.location_error,
      closeTimeout: 2000,
    }).open();
    reloadPosition(true);
  }

  function getTollgates() {
    functions.checkTollgates(app, user, function () {
      calculateTollgates();
    });
  }

  function calculateTollgates() {
    app.f7.dialog.preloader('Checking tollgates');
    tollgates = JSON.parse(localStorage.getItem(cookienames.tollgates));
    console.log(tollgates);
    var path = google.maps.geometry.encoding.decodePath(route.overview_polyline.points);
    var polyLine = new google.maps.Polyline({
      path: initialCoords
    });
    console.log(route.overview_polyline);
    var validTolls = [];
    var tollOptionz = Cookies.get(cookienames.toll_options);
    if (tollOptionz == tollOptions.my_route) {
      console.log('its my route');
      console.log(tollgates.data);
      tollgates.data.forEach(function (tollgate) {
        if (google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), polyLine, 10e-2) == true) {
          validTolls.push(tollgate);
        }
      });
    } else {
      tollgates.forEach(function (tollgate) {
        if (google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), polyLine, 10e-2) == true) {
          validTolls.push(tollgate);
        } else {
          var marker = new google.maps.Marker({
            position: mkCds(tollgate.coordinates),
            map: map,
            title: tollgate.name,
            animation: google.maps.Animation.DROP,
            //  label: tollgate.name,
            icon: tollgateIcon
          });
          var div = document.createElement('div');
          div.innerHTML = tollgate.name;
          div.onclick = function () {
            showTollgate();
          };

          var infowindow = new google.maps.InfoWindow({
            content: div
          });
          marker.addListener('click', function () {
            selectedToll = tollgate;
            infowindow.open(map, marker);
          });
        }
      });
    }

    if (validTolls.length === 0) {
      app.f7.dialog.close();
      app.f7.dialog.alert('Its estimated that there are no tollgates on this route');
    } else {
      //place markers onto the route
      View.fillTollgates({
        tollgates: validTolls,
        car: car
      });
      tollgatesPopup.open();
      console.log(validTolls);

      $('*#tollgateDetails').unbind();
      $('*#tollgateDetails').on('click', function () {
        var tollgate_id = $(this).attr('tollgate_id');
        var theToll = validTolls.filter(function (tollgate) {
          return tollgate.id == tollgate_id;
        });
        console.log(theToll[0]);
        selectedToll = theToll[0];
        showTollgate(theToll[0]);
      });

      $('*#showMarker').on('click', function () {
        var tollgate_id = $(this).attr('tollgate_id');
        var theToll = validTolls.filter(function (tollgate) {
          return tollgate.id == tollgate_id;
        });
        selectedToll = theToll[0];
        tollgatesPopup.close();
        showMarker(theToll[0]);

      });
      app.f7.dialog.close();
    }
  }

  function showMarker(tollgate) {
    var tollmarker = new google.maps.Marker({
      position: mkCds(tollgate.coordinates),
      map: map,
      title: tollgate.name,
      animation: google.maps.Animation.DROP,
      //        label: tollgate.name,
      icon: routeGate
    });

    var div = document.createElement('div');
    div.innerHTML = tollgate.name;
    div.onclick = function () {
      showTollgate(tollgate);
    };

    var infowindow = new google.maps.InfoWindow({
      content: div
    });
    tollmarker.addListener('click', function () {
      selectedToll = tollgate;
      infowindow.open(map, tollmarker);
    });
  }

  function showTollgate(tollgate) {
    console.log(tollgate);
    if (tollgate === null) {
      tollgate = selectedToll;
    }
    tollPopup = app.f7.popup.create({
      el: '.popup-tollgate',
      animate: true,
      on: {
        open: function () {
          View.fillTollgate(selectedToll, function (tollgate) {
            $('*#showTollMarker').unbind();
            $('*#showTollMarker').on('click', function () {
              tollPopup.close();
              showMarker(tollgate);
            });

            $('*#calculateDistance').unbind();
            $('*#calculateDistance').on('click', function () {
              tollPopup.close();
              if (currentPosition == null)
              navigator.geolocation.getCurrentPosition(function (position) {
                functions.calculateDistance(app, position, tollgate, user);
              }, function (error) {
                console.log(error);
                app.f7.dialog.alert(error.message);
              });
              else
              functions.calculateDistance(app, position, tollgate, user);
            });
          });
        },
        close: function () {
          View.fillTollgate(null);
        }
      }
    });
    tollgatesPopup.close();
    tollPopup.open();
  }

  function fuelConsumption() {
    app.f7.dialog.preloader('Calculating consumption');
    $.ajax({
      url: api.getPath('fuelconsumption'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        weight: car.weight,
        distance: route.legs[0].distance.value,
        car_class: car.car_class,
        fuel_type: car.fuel_type,
        email: user.email,
        phone: user.phone
      }
    }).success(function (data) {
      console.log(data);
      View.fillConsumption(data);
      consumptionPopup.open();
    }).error(function (error) {
      console.log(error);
      app.f7.dialog.alert(messages.server_error);
    }).always(function () {
      app.f7.dialog.close();
    });
  }

  function preparePage() {
    initPopups();
    $('#speedometer').hide()
    meIcon = 'img/icons/car.png';
    tollgateIcon = 'img/icons/tollgate.png';
    routeGate = 'img/icons/route.png';

    data = JSON.parse(localStorage.getItem(cookienames.routes));
    updatePosition = true;
    console.log(data);
    position = app.mainView.router.currentRoute.params.position;
    route = data.routes[position];
    user = Cookies.getJSON(cookienames.user);
    car = Cookies.getJSON(cookienames.default_car);
    initialCoords = getTurningPoints();

    if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
      j_id = Cookies.get(cookienames.journey_id);
      // refreshPosition();
      reloadPosition(true);
      updateCompass()
    }
    console.log(route);
    console.log(car);
    loadMap(position, data);

  }

  function initPopups() {
    tollgatesPopup = app.f7.popup.create({
      el: '.popup-tollgates',
      animate: true
    });
    consumptionPopup = app.f7.popup.create({
      el: '.popup-consumption',
      animate: true
    });
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
    positionRefresh.calculateRoute(position, endLat +','+endLng, directionsService, 'DRIVING').then((result, status) => {
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


  function getTurningPoints() {
    points = [];
    data.routes[position].legs[0].steps.forEach(function (value) {
      points.push(new google.maps.LatLng({
        lat: value.start_location.lat,
        lng: value.start_location.lng
      }));
    });
    return points;
  }

  function loadMap(position, data) {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    startLat = data.routes[position].legs[0].start_location.lat;
    startLng = data.routes[position].legs[0].start_location.lng;

    endLat = data.routes[position].legs[0].end_location.lat;
    endLng = data.routes[position].legs[0].end_location.lng;
    address = data.routes[position].legs[0].end_address;

    var map = new GoogleMap({
      lat: startLat,
      lng: startLng
    }, {
      lat: endLat,
      lng: endLng
    });
    map.initialize();
  }


  function GoogleMap(origin, destination) {
    mapDiv = $('#map_canvas');
    this.initialize = function () {
      map = showMap();
    };

    var showMap = function () {
      var mapOptions = {
        zoom: getBoundsZoomLevel(null, {
          height: mapDiv.height(),
          width: mapDiv.width()
        }),
        center: new google.maps.LatLng(getMidPoint(startLat, endLat), getMidPoint(startLng, endLng)),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: mapStyles,
        disableDefaultUI: true
      };

      var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      directionsDisplay.setMap(map);
      calcRoute(directionsService, directionsDisplay, origin, destination);
      return map;
    };
  }

  function calcRoute(directionsService, directionsDisplay, origin, destination) {
    var request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
      console.log(result);
      console.log(status);
    });
  }

  function getBoundsZoomLevel(bounds, mapDim) {
    var WORLD_DIM = {height: 256, width: 256};
    var ZOOM_MAX = 21;

    function latRad(lat) {
      var sin = Math.sin(lat * Math.PI / 180);
      var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = data.routes[position].bounds.northeast;
    var sw = data.routes[position].bounds.southwest;

    var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

    var lngDiff = ne.lng - sw.lng;
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  }

  function getMidPoint(start, end) {
    var mid = (start + end) / 2;
    console.log(mid.toFixed(5));
    return mid.toFixed(5);
  }

  function makeCoords(latLng) {
    var coords = latLng.split(',');
    var coordS = new google.maps.LatLng({
      lat: +coords[0],
      lng: +coords[1]
    });

    return coordS;
  }

  function mkCds(latLng) {
    var coords = latLng.split(',');
    return {
      lat: +coords[0],
      lng: +coords[1]
    }
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
    updatePosition = false;
    try {
      navigator.geolocation.clearWatch(watchID);
      // clearInterval(refreshID);
    } catch (e) {
    }
    console.log('drive outting');
  }


  return {
    init: init,
    onOut: onOut,
    reinit: reinit
  };
}
);
