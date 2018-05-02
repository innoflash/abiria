define(["app", "js/rankRoute/rankRouteView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = -1;
    var data = {};
    var route = {};
    var directionsService, directionsDisplay = null;
    var positionMarker, map = null;

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
        var currentPosition = new google.maps.LatLng({
            lat: startLat,
            lng: startLng
        });
        map.setZoom(18);
        map.setCenter(currentPosition);
        positionMarker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            title: "current position",
            animation: google.maps.Animation.DROP,
            icon: 'img/icons/me.png'
        });
        refreshPosition();
    }

    function refreshPosition() {
        refreshID = setInterval(function () {
            //         window.plugins.toast.showShortTop('updating your location');
            //pick current position and update on map
            console.log('updating position');
            navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
                locationError.bind(this),
                {
                    maximumAge: 3000,
                    timeout: 5000,
                    enableHighAccuracy: true
                });
        }, 3000);
    }

    function locationSuccess(position) {
        var newPosition = new google.maps.LatLng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        });
        map.setZoom(18);
        map.setCenter(newPosition);
        positionMarker.setPosition(newPosition);
    }

    function locationError(error) {
        window.plugins.toast.showShortBottom(JSON.stringify(error));
    }

    function openDetails() {
        app.mainView.router.navigate({
            url: '/rankDetails/' + position
        });
    }

    function preparePage() {
        position = app.mainView.router.currentRoute.params.position;
        data = JSON.parse(localStorage.getItem(cookienames.rankRoutes));
        route = data.routes[position];
        loadMap();
    }

    function loadMap() {
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
        mapDiv = $('#rank_mapova');
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
                mapTypeId: google.maps.MapTypeId.ROADMAP
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
            clearInterval(refreshID);
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