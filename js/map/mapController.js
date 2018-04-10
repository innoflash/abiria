define(["app", "js/map/mapView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = 0;
    var route = {};
    var mapDiv;

    var bindings = [];

    function preparePage() {
        route = JSON.parse(localStorage.getItem(cookienames.journey));
        console.log(route);
        loadMap();
    }

    function getTurningPoints() {
        points = [];
        route.legs[0].steps.forEach(function (value) {
            points.push({
                lat: value.start_location.lat,
                lng: value.start_location.lng
            });
        });
        return points;
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

    function loadMap() {
        var div = document.getElementById("journey_canvas")
        mapDiv = $('#journey_canvas');
        map = plugin.google.maps.Map.getMap(div, {
            controls: {
                myLocationButton: true
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

        startLat = route.legs[0].start_location.lat;
        startLng = route.legs[0].start_location.lng;

        endLat = route.legs[0].end_location.lat;
        endLng = route.legs[0].end_location.lng;
        address = route.legs[0].end_address;


        // Wait until the map is ready status.
        map.one(plugin.google.maps.event.MAP_READY, onMapReady);
    }

    function getMidPoint(start, end) {
        var mid = (start + end) / 2;
        return mid.toFixed(6);
    }

    function onMapReady() {
        $('.page-previous').hide();

        map.animateCamera({
            target: {lat: getMidPoint(startLat, endLat), lng: getMidPoint(startLng, endLng)},
            zoom: 12,
            /*     tilt: 20,
                   bearing: 140,*/
            duration: 3500
        }, function () {
            //add path
            map.addPolyline({
                points: getTurningPoints(),
                'color': '#0c5806',
                'width': 6,
                'geodesic': true
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
        onOut: onOut
    };
});