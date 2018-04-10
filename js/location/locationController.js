define(["app", "js/location/locationView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var place_id = 0;
    var data = {};

    var bindings = [
        {
            element: '#back',
            event: 'click',
            handler: restorePages
        }
    ];

    function init(query) {
        place_id = query.place_id;
        getPlaceDetails(place_id);
        View.render({
            bindings: bindings
        });
    }

    function restorePages() {
        $('#indexPage').show();
        $('#locationPage').show();
        map.remove();
    }

    function initMaps(data) {
        var div = document.getElementById("map_canvas");
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

        // Initialize the map view
        //  map = plugin.google.maps.Map.getMap(div);

        lat = data.result.geometry.location.lat;
        lng = data.result.geometry.location.lng;
        address = data.result.formatted_address;
        vicinity = data.result.vicinity;

        map.setMyLocationEnabled(true);
        map.setAllGesturesEnabled(true);

        map.setMapTypeId(plugin.google.maps.MapTypeId.ROADMAP);

        // Wait until the map is ready status.
        map.one(plugin.google.maps.event.MAP_READY, onMapReady);
    }

    function findRoutes() {
        app.f7.addNotification({
            title: 'Abiri',
            message: 'Will find routes'
        });
    }

    function tollgates() {
        app.f7.addNotification({
            title: 'Abiri',
            message: 'Will find tollgates'
        });
    }

    function onMapReady() {

        $('#indexPage').hide();
        $('#locationPage').hide();
        // Move to the position with animation

        map.animateCamera({
            target: {lat: lat, lng: lng},
            zoom: 10,
            /*     tilt: 20,
                   bearing: 140,*/
            duration: 3500
        }, function () {
            // Add a maker
            map.addMarker({
                position: {lat: lat, lng: lng},
                title: address,
                snippet: vicinity,
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {

                // Show the info window
                marker.showInfoWindow();

                // Catch the click event
                marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                    restorePages();
                    gotoRoutes();
                });

                marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                    restorePages();
                    gotoRoutes();
                });
            });
        });
    }

    function gotoRoutes() {
        map.getMyLocation(myLocationSuccess, myLocationError);
    }

    function myLocationSuccess(location) {
        app.mainView.router.loadPage('pages/routes.html?origin=' + location.latLng.lat + ',' + location.latLng.lng + '&destination=' + lat + ',' + lng);
    }

    function myLocationError(msg) {
        app.f7.alert('Cannot pick your current location, please enable location services and restart');
    }

    function getPlaceDetails(place_id) {
        app.f7.showPreloader('Getting place details');
        $.ajax({
            url: google.findPlace + place_id,
            method: 'GET'
        }).success(function (dat) {
            console.log(dat);
            this.data = dat;
            View.fillLocationName(dat.result.formatted_address);
            initMaps(dat);
        }).error(function (error) {
            app.f7.alert(messages.server_error);
        }).always(function () {
            app.f7.hidePreloader();
        });
    }

    return {
        init: init
    };
});