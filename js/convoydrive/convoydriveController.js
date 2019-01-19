define(["app", "js/convoydrive/convoydriveView"], function (app, View) {
  var $ = jQuery;
  var $$ = Dom7;
  var member_id = 0;
  var invite_id, positionWatch = 0;
  var locationData, currentPosition = null;
  var driveStarted = false;

  var bindings = [
    {
      element: '#convoyDriveOptions',
      event: 'click',
      handler: convoyDriveOptions
    }
  ];

  function convoyDriveOptions() {
    console.log('will pop up drive options');
    var buttons = [
      [
        {
          text: 'Convoy Options',
          label: true
        },
        {
          text: 'Drive',
          bold: true,
          onClick: function () {
            drive();
          }
        },
        {
          text: 'Demographics',
          bold: true,
          onClick: function () {
            convoyDemographics();
          }
        },
        {
          text: 'Members',
          onClick: function () {
            membersPopup.open();
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
    ];
    if (convoy.initiator.id === user.id) {
      buttons[0].push({
        text: 'End Convoy',
        onClick: function () {
          endJourney();
        }
      });
    }
    app.f7.actions.create({
      buttons: buttons
    }).open();
  }

  function convoyDemographics() {
    if (car === null)
    app.f7.dialog.confirm(messages.no_car, function () {
      app.mainView.router.navigate('/cars');
    });
    else
    functions.checkTollgates(app, user, function () {
      functions.calculateTollgates(app, car, convoy, View, true, {
        showMarker: function(tollgate){
          console.log(tollgate);
          functions.showMarker(map, tollgate);
        },
        calculateDistance: function(tollgate){
          if (currentPosition == null) {
            navigator.geolocation.getCurrentPosition(function(position){
              functions.calculateDistance(app, position, tollgate, user);
            }, function(error){
              app.f7.dialog.alert(error.message);
            }, {
              maximumAge: 3000,
              timeout: 5000,
              enableHighAccuracy: true
            });
          }else{
            functions.calculateDistance(app, currentPosition, tollgate, user);
          }
        }
      });
    });
  }

  function drive() {
    driveStarted = true;
    positionMarker = new google.maps.Marker({
      position: {
        lat: 0,
        lng: 0
      },
      map: map,
      title: "your position",
      animation: google.maps.Animation.DROP,
      icon: driverIcon
    });
    console.log('is driving');
    updatePosition();
    updateOnlinePosition();
    updateCompass()
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
    positionRefresh.calculateRoute(position, convoy.destination.coordinates, directionsService, 'DRIVING').then((result, status) => {
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

  function endJourney() {
    app.f7.dialog.preloader('Ending convoy...');
    $.ajax({
      url: api.getPath('decideconvoy'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        phone: user.phone,
        email: user.email,
        user_id: user.id,
        convoy_id: convoy_id,
        decision: 'end'
      }
    }).success(function (response) {
      console.log(response);
      app.f7.dialog.alert(response.message, function () {
        if (response.success) {
          app.mainView.router.back();
        }
      });
    }).error(function (error) {
      console.log(error);
      app.f7.dialog.alert(messages.server_error);
    }).always(function () {
      app.f7.dialog.close();
    });
  }

  function preparePage() {
    window.plugins.insomnia.keepAwake()
    $('#speedometer').hide();
    driverIcon = 'img/icons/car.png';
    user = Cookies.getJSON(cookienames.user);
    convoy = JSON.parse(localStorage.getItem(cookienames.convoyObject));
    car = JSON.parse(Cookies.get(cookienames.default_car));
    initPopups();
    openMap();
  }

  function updatePosition() {
    positionID = navigator.geolocation.watchPosition(function (position) {
      currentPosition = position;
      var newPosition = new google.maps.LatLng({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      map.setZoom(20);
      map.setCenter(newPosition);
      positionMarker.setPosition(newPosition);
      positionRefresh.updateSpeed(position)
    }, null, {
      maximumAge: 3000,
      timeout: 7000,
      enableHighAccuracy: true
    });

    positionWatch = setInterval(function () {
      updateOnlinePosition();
    }, appDigits.positionInterval);
  }

  function updateOnlinePosition() {
    console.log(convoy);
    if (currentPosition != null) {
      $.ajax({
        url: api.getPath('update-location'),
        method: 'POST',
        timeout: appDigits.timeout,
        data: {
          invite_id: convoy.id.invite,
          position: currentPosition,
          phone: user.phone,
          email: user.email
        }
      }).success(function (response) {
        console.log(response);
      }).error(function (error) {
        console.log(error);
      });
    }
  }

  function initPopups() {
    membersPopup = app.f7.popup.create({
      el: '.popup-convoy-members',
      animate: true,
      on: {
        open: function () {
          console.log('popup opened');
          clearInterval(positionWatch);
          View.fillMembers(convoy.invites.data);
          $('*#memberIntel').on('click', function () {
            invite_id = $(this).attr('invite_id');
            member_id = $(this).attr('member_id');
            member_name = $(this).attr('member_name');
            console.log(member_name);
            if (member_id != user.id) {
              membersPopup.close();
              getMemberDetails(invite_id);
            }
          });
        },
        close: function () {
          View.fillMembers(null);
          console.log('members popup closed');
          updatePosition();
        }
      }
    });

    memberPopup = app.f7.popup.create({
      el: '.popup-convoy-member',
      animate: true,
      on: {
        open: function () {
          console.log(locationData);
          View.fillLocationDetails(locationData, function (locationData) {
            $('#geocodeUser').show(100);
            $('#geocodeUser').unbind();
            $('#geocodeUser').on('click', function () {
              if (currentPosition != null) {
                geocodeUser(currentPosition, locationData);
              } else {
                navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
                locationError.bind(this),
                {
                  maximumAge: 3000,
                  timeout: 5000,
                  enableHighAccuracy: true
                });
              }
            });

          });
        },
        close: function () {
          openMap();
          console.log('popup closed');
        }
      }
    });
  }

  function geocodeUser(currentPosition, locationData) {
    $('#gapMap').css('height', '300px');
    map = new GoogleMap({
      lat: currentPosition.coords.latitude,
      lng: currentPosition.coords.longitude
    }, {
      lat: +locationData.location.position.coords.latitude,
      lng: +locationData.location.position.coords.longitude
    }, "gapMap");
    map.initialize();
    var request = {
      origin: {
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude
      },
      destination: {
        lat: +locationData.location.position.coords.latitude,
        lng: +locationData.location.position.coords.longitude
      },
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
      if (status == 'OK') {
        View.fillGeocode({
          distance: result.routes[0].legs[0].distance.text,
          duration: result.routes[0].legs[0].duration.text,
          summary: result.routes[0].summary,
          address: result.routes[0].legs[0].end_address
        }, function () {
          $('#geocodeUser').hide(100);
          directionsDisplay.setDirections(result);
        });
        console.log(result);
      }
    });
  }

  function locationSuccess(position) {
    currentPosition = position;
    geocodeUser(currentPosition, locationData);
  }

  function getMemberDetails(invite_id) {
    app.f7.dialog.preloader('Getting intel on ' + member_name + '...');
    $.ajax({
      url: api.getPath('getlocation'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        invite_id: invite_id,
        phone: user.phone,
        email: user.email
      }
    }).success(function (response) {
      console.log(response);
      if (response.success === false) {
        app.f7.dialog.alert(response.message);
      } else {
        locationData = response.data;
        memberPopup.open();
      }
    }).error(function (error) {
      console.log(error);
      app.f7.dialog.alert(messages.server_error);
    }).always(function () {
      app.f7.dialog.close();
    });
  }

  function locationError(error) {
    console.log(error);
    app.f7.dialog.confirm('Couldn`t pick your location right now, we want to use it to calculate the geometry ' +
    'between you folks, would you wanna try again?', function () {
      navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
      locationError.bind(this),
      {
        maximumAge: 3000,
        timeout: 5000,
        enableHighAccuracy: true
      });
    });
  }

  function openMap() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    map = new GoogleMap(maps.makeCoords(convoy.departure.coordinates), maps.makeCoords(convoy.destination.coordinates), "convoyDriveMap");
    map.initialize();
    console.log(driveStarted);
    if (driveStarted === true) {
      drive();
    }
  }

  function GoogleMap(origin, destination, mapDiv) {
    this.initialize = function () {
      map = showMap();
    };

    var showMap = function () {
      console.log(maps.getMidPoint(origin, destination));
      var mapOptions = {
        zoom: 12,
        center: maps.getMidPoint(origin, destination),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        tilt: 45,
        styles: mapStyles,
        disableDefaultUI: true
      };

      var map = new google.maps.Map(document.getElementById(mapDiv), mapOptions);
      directionsDisplay.setMap(map);
      calcRoute(directionsService, directionsDisplay, origin, destination, pinBreaks);
      return map;
    };
  }

  function calcRoute(directionsService, directionsDisplay, origin, destination, pinBreaks) {
    var request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(result);
        routeResult = result;
        pinBreaks(map);
      }
      console.log(result);
      console.log(status);
    });
  }

  var pinBreaks = function (map) {
    convoy.breaks.forEach(function (cBreak) {
      var marker = new google.maps.Marker({
        position: maps.makeCoords(cBreak.coordinates),
        map: map,
        title: cBreak.description,
        animation: google.maps.Animation.DROP,
        //  label: tollgate.name,
      });
      var div = document.createElement('div');
      div.innerHTML = cBreak.description;

      var infowindow = new google.maps.InfoWindow({
        content: div
      });
      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
    });
  };

  function init() {
    preparePage();
    View.render({
      bindings: bindings
    });
  }

  function onOut() {
    clearInterval(positionWatch);
    memberPopup.close();
    membersPopup.close();
    navigator.geolocation.clearWatch(positionID)
    window.plugins.insomnia.allowSleepAgain()
    console.log('convoydrive outting');
  }

  function reinit() {
    console.log('reinitialising');
  }

  return {
    init: init,
    onOut: onOut,
    reinit: reinit
  };
});
