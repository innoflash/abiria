var functions = {
    hasCookie: function (cookie_name) {
        if (Cookies.get(cookie_name) === undefined) {
            return false;
        } else {
            return true;
        }
    },
    isFieldsValid: function (validate_user_fields, app, type) {
        $string = new Array();
        $error_msg = '';
        var y = 0;
        for ($x = 0; $x < validate_user_fields.length; $x++) {
            if (validate_user_fields[$x].val().length == 0) {
                $string.push(validate_user_fields[$x]);
                if (validate_user_fields[$x].attr('placeholder') == '---') {
                    $error_msg += validate_user_fields[$x].attr('name') + " can`t be blank<br/>";
                } else {
                    $error_msg += validate_user_fields[$x].attr('placeholder') + " can`t be blank<br/>";
                }

            }
        }
        if ($string.length == 0) {
            return true;
        } else {
            if (type === undefined) {
                var notification = app.f7.notification.create({
                    icon: '<i class="f7-icons">chat</i>',
                    subtitle: 'Fields alert !!!',
                    text: $error_msg
                });
                notification.open();
            } else {
                app.f7.dialog.alert($error_msg);
            }
            return false;
        }
    },
    appDefaultSettings: function () {
        Cookies.set(cookienames.toll_options, tollOptions.my_route);
        Cookies.set(cookienames.etoll_options, false);
        Cookies.set(cookienames.rank_radius, 3);
        Cookies.set(cookienames.rank_routes, "walking");
        Cookies.set(cookienames.default_country, coutries.south_africa);
        Cookies.set(cookienames.position_interval, 375);
    },
    calculateTollgates: function (app, car, convoy, view, hasMap, callBacks) {
        app.f7.dialog.preloader('Checking tollgates');
        tollgates = JSON.parse(localStorage.getItem(cookienames.tollgates));
        console.log(tollgates);
        this.getTurningPoints(convoy, function (turningPoints, distance) {
            var polyLine = new google.maps.Polyline({
                path: turningPoints
            });
            var validTolls = [];
            console.log(tollgates.data);
            tollgates.data.forEach(function (tollgate) {
                if (google.maps.geometry.poly.isLocationOnEdge(functions.makeCoordinates(tollgate.coordinates), polyLine, 10e-2) == true) {
                    validTolls.push(tollgate);
                }
            });
            app.f7.dialog.close();
            if (validTolls.length === 0) {
                app.f7.dialog.alert('Its estimated that there are no tollgates on this route');
            } else {
                tollgatesPopup = app.f7.popup.create({
                    el: '.popup-tollgates',
                    animate: true,
                    on: {
                        open: function () {
                            view.fillTollgates({
                                tollgates: validTolls,
                                car: car
                            }, function () {
                                if (hasMap === false || hasMap === undefined)
                                    $('*#showMarker').hide();

                                $('*#tollgateDetails').unbind();
                                $('*#tollgateDetails').on('click', function () {
                                    var tollgate_id = $(this).attr('tollgate_id');
                                    var theToll = validTolls.filter(function (tollgate) {
                                        return tollgate.id == tollgate_id;
                                    });
                                    tollgatesPopup.close();
                                    functions.showTollgate(app, view, hasMap, theToll[0], callBacks);
                                });

                                $('*#showMarker').unbind();
                                $('*#showMarker').on('click', function(){
                                  if(typeof callBacks.showMarker === 'function'){
                                    var tollgate_id = $(this).attr('tollgate_id');
                                    var theToll = validTolls.filter(function (tollgate) {
                                        return tollgate.id == tollgate_id;
                                    });
                                    tollgatesPopup.close();
                                    callBacks.showMarker(theToll[0]);
                                  }
                                });

                                app.f7.dialog.confirm('Would you like to have fuel consumption calculated for this convoy?', function(){
                                  functions.fuelConsumption(app, view, car, user, distance);
                                });
                            });
                        },
                        close: function () {
                            $('*#showMarker').show();
                        }
                    }
                });
                tollgatesPopup.open();
            }
        });

    },
    checkTollgates: function (app, user, tollgatesCallback) {
        if (functions.hasCookie(cookienames.has_tollgates) == false || functions.hasCookie(cookienames.has_tollgates) == 'false') {
            app.f7.dialog.preloader('Getting tollgates');
            $.ajax({
                url: api.getPath('tollagates'),
                timeout: appDigits.timeout,
                method: 'POST',
                email: user.email,
                phone: user.phone
            }).success(function (tollgates) {
                console.log(tollgates);
                localStorage.setItem(cookienames.tollgates, JSON.stringify(tollgates.data));
                Cookies.set(cookienames.has_tollgates, true, {
                    expires: 21
                });
                if (typeof tollgatesCallback === 'function')
                    tollgatesCallback();
            }).error(function (error) {
                console.log(error);
            }).always(function () {
                app.f7.dialog.close();
            });
        } else {
            if (typeof tollgatesCallback === 'function')
                tollgatesCallback();
        }
    },
    getTurningPoints: function (convoy, callBack) {
        console.log('getting turning points');
        var points = [];
        directionsService = new google.maps.DirectionsService();
        var request = {
            origin: this.makeCoordinates(convoy.departure.coordinates),
            destination: this.makeCoordinates(convoy.destination.coordinates),
            travelMode: 'DRIVING'
        };
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {
                console.log(result);
                result.routes[0].legs[0].steps.forEach(function (value) {
                    points.push(value.start_location);
                });
                console.log(points);
                if (typeof callBack === 'function')
                    callBack(points, result.routes[0].legs[0].distance.value);
                return points;
            }
        });
        return 'turning points';
    },
    makeCoordinates: function (latLng) {
        var coords = latLng.split(',');
        var coordS = {
            lat: +coords[0],
            lng: +coords[1]
        };
        return new google.maps.LatLng(coordS);
    },
    showTollgate: function (app, view, hasMap, tollgate, callBacks) {
        tollPopup = app.f7.popup.create({
            el: '.popup-tollgate',
            animate: true,
            on: {
                open: function () {
                    view.fillTollgate(tollgate, function (tollgate) {
                        if (hasMap === false || hasMap === undefined){
                            $('*#showTollMarker').hide();
                            $('*#calculateDistance').hide();
                        }else{
                          $('*showTollMarker').unbind();
                          $('#showTollMarker').on('click', function(){
                            tollPopup.close();
                            if(callBacks.showMarker && typeof callBacks.showMarker === 'function')
                              callBacks.showMarker(tollgate);
                          });

                            $('*#calculateDistance').unbind();
                            $('*#calculateDistance').on('click', function(){
                              tollPopup.close();
                              if(callBacks.calculateDistance && typeof callBacks.calculateDistance === 'function')
                                callBacks.calculateDistance(tollgate);
                            });
                        }
                    });
                },
                close: function () {
                    $('*#showTollMarker').show();
                    $('*#calculateDistance').show();
                }
            }
        });
        tollgatesPopup.close();
        tollPopup.open();
    },
    fuelConsumption: function(app, view, car, user, distance){
      console.log(view);
      consumptionPopup = app.f7.popup.create({
          el: '.popup-consumption',
          animate: true
      });
      app.f7.dialog.preloader('Calculating consumption');
      $.ajax({
          url: api.getPath('fuelconsumption'),
          method: 'POST',
          timeout: appDigits.timeout,
          data: {
              weight: car.weight,
              distance: distance,
              car_class: car.car_class,
              fuel_type: car.fuel_type,
              email: user.email,
              phone: user.phone
          }
      }).success(function (data) {
          console.log(data);
          view.fillConsumption(data);
          consumptionPopup.open();
      }).error(function (error) {
          console.log(error);
          app.f7.dialog.alert(messages.server_error);
      }).always(function () {
          app.f7.dialog.close();
      });
    },
    showMarker: function(map, tollgate){
      var routeGate = 'img/icons/route.png';
      var tollmarker = new google.maps.Marker({
          position: functions.makeCoordinates(tollgate.coordinates),
          map: map,
          title: tollgate.name,
          animation: google.maps.Animation.DROP,
          //        label: tollgate.name,
          icon: routeGate
      });

      var div = document.createElement('div');
      div.innerHTML = tollgate.name;
      div.onclick = function () {

      };

      var infowindow = new google.maps.InfoWindow({
          content: div
      });
      tollmarker.addListener('click', function () {
          infowindow.open(map, tollmarker);
      });
    },
    calculateDistance: function(app, currentPosition, tollgate, user) {
      var request = {
          origin: {
              lat: currentPosition.coords.latitude,
              lng: currentPosition.coords.longitude
          },
          destination: functions.makeCoordinates(tollgate.coordinates),
          travelMode: 'DRIVING'
      };
      directionsService.route(request, function (result, status) {
          if (status == 'OK') {
              app.f7.dialog.alert('Hi ' + user.first_name + ', its about ' + result.routes[0].legs[0].distance.text +
                  ' to this tollgate. It will take you like ' + result.routes[0].legs[0].duration.text + ' using ' + result.routes[0].summary);
              console.log(result);
          }
      });
    }
};
