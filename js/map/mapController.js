define(["app", "js/map/mapView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = 0;
    var journey = {};
    var mapDiv;

    var bindings = [];

    function preparePage() {
        journey = JSON.parse(localStorage.getItem(cookienames.journey));
        console.log(journey);
        loadMap();
    }

    function loadMap() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        var map = new GoogleMap(makeCoords(journey.departure.coordinates), makeCoords(journey.destination.coordinates));
        map.initialize();
        updateHeading(makeCoords(journey.departure.coordinates));


    }

    function updateHeading(currentPosition) {
        console.log(currentPosition);
        console.log(makeCoords(destination));
        var heading = google.maps.geometry.spherical.computeHeading(currentPosition, makeCoords(destination));
        console.log(heading);
        map.setHeading(heading);
        /*        mapDiv.css({
                    'transform': 'rotate(' + heading + 'deg)'
                });*/
        var div = document.getElementById("rank_mapova");
        googleMap = plugin.google.maps.Map.getMap(div);
        googleMap.one(plugin.google.maps.event.MAP_READY, function() {
            console.log("--> map_canvas3 : ready.");
            app.f7.dialog.alert('yeeey i am ready');
        });
    }

    function GoogleMap(origin, destination) {
        mapDiv = $('#journey_canvas');
        this.initialize = function () {
            map = showMap();
        };

        var showMap = function () {
            console.log(midPoint(origin, destination));
            var mapOptions = {
                zoom: 21,
                center: midPoint(origin, destination),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                tilt: 45,
            };

            var map = new google.maps.Map(document.getElementById("journey_canvas"), mapOptions);
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
            }
            console.log(result);
            console.log(status);
        });
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

    function onOut() {
        /*app.f7.dialog.close();*/
        $('.page-previous').show();
        map.remove();
        console.log('map outting here');
    }

    return {
        init: init,
        onOut: onOut,
        reinit: function () {
            
        }
    };
});