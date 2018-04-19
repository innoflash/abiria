define(["app", "js/drive/driveView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var car = {};
    var position = 0;
    var data = {};
    var route = {};
    var polyLine = {};
    var tollgates = {};
    var j_id = 0;
    var initialCoords = {};
    var selectedToll = {};
    var tollPopup = {};
    var positionMarker = null;
    var mapDiv;

    var bindings = [
        {
            element: '#driveOptions',
            event: 'click',
            handler: driveOptions
        }, {
            element: '#calculateDistance',
            event: 'click',
            handler: calculateDistance
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

    function fuelConsumption() {
        app.f7.dialog.preloader('Calculating consumption');
        $.ajax({
            url: app_apis.abiri + 'abiri-fuelconsumption',
            method: 'POST',
            timeout: 3000,
            data: {
                weight: car.weight,
                distance: route.legs[0].distance.value,
                car_class: car.car_class
            }
        }).success(function (data) {
            app.f7.dialog.alert('This journey is estimated to use ' + data.min.toFixed(2) + ' to ' + data.max.toFixed(2) + ' litres of fuel');
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function refreshPosition() {

        if (positionMarker == null) {
            map.addMarker({
                position: {
                    lat: startLat,
                    lng: startLng
                },
                title: "Me",
                snippet: 'my current position',
                icon: 'green',
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {
                positionMarker = marker;
                marker.showInfoWindow();
                //   refreshPosition();
            });
        }
        refreshID = setInterval(function () {
            window.plugins.toast.showShortTop('finding new location');
            //pick current position and update on map
            map.getMyLocation(successCallback.bind(this), errorCallback.bind(this));
        }, 30000);
    }

    function successCallback(position) {
        positionMarker.setPosition(position.latLng);
    }

    function errorCallback() {
        var option = {
            enableHighAccuracy: true, // use GPS as much as possible
            timeout: 3000
        };
        plugin.google.maps.LocationService.getMyLocation(option, successCallback.bind(this));
    }

    function calculateDistance() {
        console.log('calculating distance');
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

    function toggleJourney() {
        console.log(route);
        var data = {
            driver_id: user.id,
            car_id: car.id,
            from: route.legs[0].start_address,
            from_coords: route.legs[0].start_location.lat + ',' + route.legs[0].start_location.lng,
            to: route.legs[0].end_address,
            to_coords: route.legs[0].end_location.lat + ',' + route.legs[0].end_location.lng,
            route: JSON.stringify(route),
            duration: route.legs[0].duration.text,
            distance: route.legs[0].distance.text
        };
        //  app.f7.dialog.alert(JSON.stringify(data));
        if (j_id == 0) {
            app.f7.dialog.preloader('Starting journey');
            $.ajax({
                url: app_apis.abiri + 'abiri-makejourney',
                method: 'POST',
                timeout: 3000,
                data: data
            }).success(function (data) {
                map.addMarker({
                    position: {
                        lat: startLat,
                        lng: startLng
                    },
                    title: "Me",
                    snippet: 'my current position',
                    icon: 'green',
                    animation: plugin.google.maps.Animation.BOUNCE
                }, function (marker) {
                    positionMarker = marker;
                    marker.showInfoWindow();

                });
                j_id = data.j_id;
                refreshPosition();
                Cookies.set(cookienames.journey_started, true);
                Cookies.set(cookienames.journey_id, data.j_id);
                Cookies.set(cookienames.position, position);

                window.plugins.toast.showShortBottom('Your journey has been started...');
                var notification = app.f7.notification.create({
                    icon: '<i class="f7-icons">chat</i>',
                    subtitle: 'Journey alert !!!',
                    text: data.message,
                    closeOnClick: true,
                    titleRightText: 'now',
                    on: {
                        close: function () {
                            if (data.success) {
                                cordova.plugins.notification.local.schedule({
                                    id: j_id,
                                    title: 'Abiri',
                                    text: 'A journey in progress',
                                    foreground: true,
                                    icon: 'img/abiri.png',
                                    smallIcon: 'img/abiri.png',
                                    badge: 1,
                                    data: notificationData,
                                    actions: [{
                                        id: 'gotoJourney',
                                        type: 'button',
                                        title: 'Go to journey'
                                    }]
                                });

                                cordova.plugins.notification.local.on('click', gotoJourney, this);
                                cordova.plugins.notification.local.on('gotoJourney', gotoJourney, this);
                            }
                        }
                    }
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

    function gotoJourney(notification, eopts) {
        loadMap(notification.data.position, notification.data.data);
    }

    function alterJourney(statement, state) {
        app.f7.dialog.preloader(statement);
        $.ajax({
            url: app_apis.abiri + 'abiri-updatejourney',
            method: 'POST',
            timeout: 3000,
            data: {
                j_id: j_id,
                state: state
            }
        }).success(function (data) {
            console.log(data);
            app.f7.dialog.alert(data.message, function () {
                if (data.success) {
                    Cookies.set(cookienames.journey_started, false);
                    Cookies.set(cookienames.journey_id, 0);
                    Cookies.remove(cookienames.journey_id);
                    cordova.plugins.notification.local.cancel(Cookies.get(cookienames.journey_id), undoJourney);
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

    function undoJourney() {
        Cookies.set(cookienames.journey_started, false);
        Cookies.set(cookienames.journey_id, 0);
        j_id = 0;
    }

    function tollUpdates() {
        console.log('will get toll gates according to the current position relative to destination');
        if (functions.hasCookie(cookienames.has_tollgates) == false) {
            getTollgates();
        } else {
            calculateTollgates();
        }

        /*        var showEtolls = Cookies.get(cookienames.etolls);
                if (showEtolls) {
                    if (functions.hasCookie(cookienames.has_etolls) == false) {
                        getEtolls();
                    } else {
                        showEtolls();
                    }
                }*/
    }

    function getEtolls() {
        $.ajax({
            url: app_apis.abiri + 'abiri-etolls',
            timeout: 3000,
            method: 'POST'
        }).success(function (etolls) {
            console.log(etolls);
            localStorage.setItem(cookienames.etolls, JSON.stringify(etolls));
            Cookies.set(cookienames.has_etolls, true, {
                expires: 21
            });
            showEtolls()
        }).error(function (error) {
            console.log(error);
        });
    }

    function showEtolls() {
        etolls = JSON.parse(localStorage.getItem(cookienames.etolls));
        etolls.forEach(function (eToll) {
            map.addMarker({
                position: makeCoords(eToll.coordinates),
                title: eToll.name,
                snippet: 'E-toll',
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {
                marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                    marker.showInfoWindow();
                });
                marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                    loadEtollInfo(eToll);
                });
            });
        });
    }

    function loadEtollInfo(eToll) {

    }

    function calculateTollgates() {
        app.f7.dialog.preloader('Checking tollgates');
        tollgates = JSON.parse(localStorage.getItem(cookienames.tollgates));
        console.log(tollgates);
        var validTolls = [];
        var tollOptionz = Cookies.get(cookienames.toll_options);
        tollgates.forEach(function (tollgate) {
            if (tollOptionz == tollOptions.all_tolls) {
                if (plugin.google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), initialCoords)) {
                    console.log('contained', tollgate);
                    validTolls.push(tollgate);
                } else {
                    map.addMarker({
                        position: makeCoords(tollgate.coordinates),
                        title: tollgate.name,
                        snippet: tollgate.type,
                        animation: plugin.google.maps.Animation.BOUNCE
                    }, function (marker) {
                        marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                            marker.showInfoWindow();
                        });

                        marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                            loadTollgateInfo(tollgate);
                        });
                    });
                }
            } else {
                if (plugin.google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), initialCoords)) {
                    console.log('contained', tollgate);
                    validTolls.push(tollgate);
                }
            }

        });
        if (validTolls.length == 0) {
            app.f7.dialog.close();
            app.f7.dialog.alert('Its estimated that there are no tollgates on this route');
        } else {
            //place markers onto the route
            validTolls.forEach(function (tollgate) {
                map.addMarker({
                    position: makeCoords(tollgate.coordinates),
                    title: tollgate.name,
                    snippet: tollgate.type,
                    animation: plugin.google.maps.Animation.BOUNCE
                }, function (marker) {
                    marker.setIcon("blue");
                    marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                        loadTollgateInfo(tollgate);
                    });

                    marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                        marker.showInfoWindow();
                        selectedToll = tollgate;
                    });
                });
            });
            app.f7.dialog.close();
        }
    }

    function loadTollgateInfo(tollgate) {
        console.log(tollgate);
        selectedToll = tollgate;
        //display toll details on a popup
        //View.fillTollgate(tollgate);
        tollPopup = app.f7.popup.create({
            el: '.popup-tollgate',
            animate: true,
            on: {
                open: function () {
                    View.fillTollgate(selectedToll);
                }
            }
        });
        tollPopup.open();
    }

    function makeCoords(latLng) {
        var coords = latLng.split(',');
        return {
            lat: +coords[0],
            lng: +coords[1]
        };
    }

    function getTollgates() {
        app.f7.dialog.preloader('Getting tollgates');
        $.ajax({
            url: app_apis.abiri + 'abiri-tollgates',
            timeout: 3000,
            method: 'POST'
        }).success(function (tollgates) {
            console.log(tollgates);
            localStorage.setItem(cookienames.tollgates, JSON.stringify(tollgates));
            Cookies.set(cookienames.has_tollgates, true, {
                expires: 21
            });
            calculateTollgates();
        }).error(function (error) {
            console.log(error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function preparePage() {
        data = JSON.parse(localStorage.getItem(cookienames.routes));
        position = app.mainView.router.currentRoute.params.position;
        route = data.routes[position];
        user = Cookies.getJSON(cookienames.user);
        car = Cookies.getJSON(cookienames.default_car);
        if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
            j_id = Cookies.get(cookienames.journey_id);
            refreshPosition();
        }
        loadMap(position, data);
        notificationData = {
            position: position,
            data: data
        };
    }

    function getTurningPoints() {
        points = [];
        data.routes[position].legs[0].steps.forEach(function (value) {
            points.push({
                lat: value.start_location.lat,
                lng: value.start_location.lng
            });
        });
        return points;
    }

    function loadMap(position, data) {
        var div = document.getElementById("map_canvas");
        mapDiv = $('#map_canvas');
        map = plugin.google.maps.Map.getMap(div, {
            controls: {
                myLocationButton: true,
                myLocation: true
            },
            gestures: {
                'scroll': true,
                'tilt': true,
                'rotate': true,
                'zoom': true
            }
        });
        map.setMyLocationEnabled(true);
        map.setAllGesturesEnabled(true);

        map.setMapTypeId(plugin.google.maps.MapTypeId.ROADMAP);

        startLat = data.routes[position].legs[0].start_location.lat;
        startLng = data.routes[position].legs[0].start_location.lng;

        endLat = data.routes[position].legs[0].end_location.lat;
        endLng = data.routes[position].legs[0].end_location.lng;
        address = data.routes[position].legs[0].end_address;


        // Wait until the map is ready status.
        map.one(plugin.google.maps.event.MAP_READY, onMapReady);
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

    function onMapReady() {
        $('#allRoutes').hide();
        $('#routeDetails').hide();

        $('.page-previous').hide();

        //      $('#map_canvas').hide();

        initialCoords = getTurningPoints();

        map.animateCamera({
            target: {lat: getMidPoint(startLat, endLat), lng: getMidPoint(startLng, endLng)},
            zoom: getBoundsZoomLevel(null, {
                height: mapDiv.height(),
                width: mapDiv.width()
            }),
            /*     tilt: 20,
                   bearing: 140,*/
            duration: 3500
        }, function () {
            //add path
            map.addPolyline({
                points: initialCoords,
                'color': '#0c5806',
                'width': 6,
                'geodesic': true
            }, function (polyline) {
                polyLine = polyline;
                //  app.f7.dialog.alert(JSON.stringify(polyLine));
            });

            // Add a maker
            map.addMarker({
                position: {lat: endLat, lng: endLng},
                title: address,
                snippet: 'my destination',
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {

                // Show the info window
                marker.showInfoWindow();

            });
        });
    }

    function getMidPoint(start, end) {
        var mid = (start + end) / 2;
        return mid.toFixed(6);
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*   app.f7.dialog.close();*/
        try {
            clearInterval(refreshID);
        } catch (e) {
        }
        map.clear();
        map.remove();
        /*$('#allRoutes').show();
        $('#routeDetails').show();
        $('.page-previous').show();*/
        console.log('map outting here');
    }

    function reinit() {
        console.log('reinitialising');
        //  app.mainView.router
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});