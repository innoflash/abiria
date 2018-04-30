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
    var map;
    var directionsService, directionsDisplay = null;

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
                            //  toggleJourney();
                        }
                    },
                    {
                        text: 'Cancel Journey',
                        bold: true,
                        onClick: function () {
                            //   cancelJourney();
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

    function tollUpdates() {
        console.log('will get toll gates according to the current position relative to destination');
        if (functions.hasCookie(cookienames.has_tollgates) == false) {
            getTollgates();
        } else {
            calculateTollgates();
        }
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

    function calculateTollgates() {
        // app.f7.dialog.preloader('Checking tollgates');
        tollgates = JSON.parse(localStorage.getItem(cookienames.tollgates));
        console.log(tollgates);
        var path = google.maps.geometry.encoding.decodePath(route.overview_polyline.points);
        var polyLine = new google.maps.Polyline({
            path: initialCoords
        });
        console.log(route.overview_polyline);
        var validTolls = [];
        var tollOptionz = Cookies.get(cookienames.toll_options);
        tollgates.forEach(function (tollgate) {
            if (tollOptionz == tollOptions.all_tolls) {
                if (google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), polyLine, 10e-1)) {
                    console.log('all contained', tollgate);
                    validTolls.push(tollgate);
                } else {
                    var marker = new google.maps.Marker({
                        position: mkCds(tollgate.coordinates),
                        map: map,
                        title: tollgate.name,
                        animation: google.maps.Animation.DROP
                    });

                  //  map.addMarker(marker);
                    /*map.addMarker({
                        position: makeCoords(tollgate.coordinates),
                        title: tollgate.name,
                        snippet: tollgate.type,
                        animation: plugin.google.maps.Animation.BOUNCE
                    }, function (marker) {
                        marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                            marker.showInfoWindow();
                        });

                        marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                         //   loadTollgateInfo(tollgate);
                        });
                    });*/
                    console.log('not contained all tolls');

                }
            } else {
                // console.log(google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), polyLine));
                if (google.maps.geometry.poly.isLocationOnEdge(makeCoords(tollgate.coordinates), polyLine, 10e-1)) {
                    console.log('routes contained', tollgate);
                    validTolls.push(tollgate);
                } else {
                    console.log('not contained route tolls');
                }
            }

        });
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
                car_class: car.car_class,
                fuel_type: car.fuel_type
            }
        }).success(function (data) {
            app.f7.dialog.alert('This journey is estimated to use \n' + data.min.toFixed(2) + ' to ' + data.max.toFixed(2) + ' litres \nof fuel and \nR ' + data.cost_min.toFixed(2) + ' - R' + data.cost_max.toFixed(2) + ' in fuel costing');
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
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
        initialCoords = getTurningPoints();
        if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
            j_id = Cookies.get(cookienames.journey_id);
            //   refreshPosition();
        }
        console.log(route);
        console.log(car);
        loadMap(position, data);

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
            var map = showMap();
        };

        var showMap = function () {
            var mapOptions = {
                zoom: getBoundsZoomLevel(null, {
                    height: mapDiv.height(),
                    width: mapDiv.width()
                }),
                center: new google.maps.LatLng(getMidPoint(startLat, endLat), getMidPoint(startLng, endLng)),
                mapTypeId: google.maps.MapTypeId.ROADMAP
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
        /* app.f7.dialog.close();
         console.log(app.f7.dialog);
         try {
             app.f7.dialog.close();
         } catch (e) {
         }*/
        console.log('drive outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});