define(["app", "js/rankRoute/rankRouteView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = -1;
    var data = {};
    var route = {};
    var directionsService, directionsDisplay = null;
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
        var currentPosition = new google.maps.LatLng(makeCoords(origin));
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
    }

    function refreshPosition() {
        watchID = navigator.geolocation.watchPosition(locationSuccess.bind(this), locationError.bind(this), {
            maximumAge: 3000,
            timeout: 7000,
            enableHighAccuracy: true
        });
    }

    function locationSuccess(position) {
        console.log(position);
        var newPosition = new google.maps.LatLng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        });
        map.setZoom(18);
        map.setCenter(newPosition);
        positionMarker.setPosition(newPosition);
        updateHeading(newPosition);
    }

    function locationError(error) {
        console.log(error);
        app.f7.toast.create({
            text: messages.location_error,
            closeTimeout: 2000,
        }).open();
    }

    function openDetails() {
        app.f7.dialog.alert('Your route to ' + rankname +
            ' via ' + routeResult.routes[0].summary +
            ' is estimated to be ' + routeResult.routes[0].legs[0].distance.text +
            ' and will probably take you ' + routeResult.routes[0].legs[0].duration.text, 'Hi ' + user.first_name);
    }

    function preparePage() {
        pedestrianIcon = 'img/icons/pedestrian.png';
        origin = app.mainView.router.currentRoute.params.origin;
        destination = app.mainView.router.currentRoute.params.destination;
        rankname = app.mainView.router.currentRoute.params.rankname;
        user = Cookies.getJSON(cookienames.user);
        data = JSON.parse(localStorage.getItem(cookienames.rankRoutes));
        loadMap();
    }

    function loadMap() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        var map = new GoogleMap(makeCoords(origin), makeCoords(destination));
        map.initialize();
        updateHeading(makeCoords(origin));
    }

    function updateHeading(currentPosition) {
        console.log(currentPosition);
        console.log(makeCoords(destination));
        var heading = google.maps.geometry.spherical.computeHeading(currentPosition, makeCoords(destination));
        console.log(heading);
        map.setHeading(heading);
    }

    function GoogleMap(origin, destination) {
        mapDiv = $('#rank_mapova');
        this.initialize = function () {
            map = showMap();
        };

        var showMap = function () {
            console.log(midPoint(origin, destination));
            var mapOptions = {
                zoom: 21,
                center: midPoint(origin, destination),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                tilt: 45
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

    function midPoint(origin, destination) {
        return {
            lat: +((origin.lat + destination.lat) / 2).toFixed(5),
            lng: +((origin.lng + destination.lng) / 2).toFixed(5),
        }
    }

    function makeCoords(latLng) {
        var coords = latLng.split(',');
        var coordS = {
            lat: +coords[0],
            lng: +coords[1]
        };
        console.log(coordS);
        return new google.maps.LatLng(coordS);
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
        try {
            navigator.geolocation.clearWatch(watchID);
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