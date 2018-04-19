define(["app", "js/rankRoute/rankRouteView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = -1;
    var data = {};
    var route = {};

    var bindings = [
        {
            element: '#openDetails',
            event: 'click',
            handler: openDetails
        }
    ];


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
        var div = document.getElementById("rank_mapova");
        mapDiv = $('#rank_mapova');
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
        map.one(plugin.google.maps.event.MAP_READY, onMapReady.bind(this));
    }


    function getMidPoint(start, end) {
        var mid = (start + end) / 2;
        return mid.toFixed(6);
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

    function onMapReady() {
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
        try {
            map.clear();
            map.remove();
        } catch (e) {
        }
       /* app.f7.dialog.close();*/
        console.log('rankRoute outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});