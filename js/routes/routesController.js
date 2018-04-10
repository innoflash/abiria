define(["app", "js/routes/routesView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var place_id = 0;
    var map = {};
    var locationPopup = {};

    var bindings = [];

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('routes outting');
        try {
            map.remove();
        } catch (e) {
        }
        $('#destinationPage').show();
        $('.page-previous').show();
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        place_id = app.mainView.router.currentRoute.params.place_id;
        console.log(app.mainView.router.currentRoute.params);

        locationPopup = app.f7.popup.create({
            el: '.popup-mylocation',
            animate: true,
            on: {
                open: function () {
                    app.f7.searchbar.create({
                        el: '.originSearchbar'
                    });
                    $('#originSearch').keyup(function () {
                        searchResults();
                    });
                }
            }
        });
        app.f7.dialog.preloader('Picking your location');
        var option = {
            enableHighAccuracy: true, // use GPS as much as possible
            timeout: 3000
        };
        plugin.google.maps.LocationService.getMyLocation(option, locationSuccess.bind(this), locationError.bind(this));
    }

    function locationError(error) {
        var map = this;
        app.f7.dialog.close();
        var mapDiv = document.getElementById("routeMaps");
        map = plugin.google.maps.Map.getMap(mapDiv, {
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
        map.one(plugin.google.maps.event.MAP_READY, onMapReady);
    }

    function searchResults() {
        if ($$("#originSearch").val().length >= 5) {
            $.ajax({
                url: google.findPlaces + $('#originSearch').val(),
                timeout: 3000,
                method: 'GET'
            }).success(function (data) {
                if (data.status == 'OK') {
                    View.fillPlaces(data);
                    $('*#getLocation').on('click', function () {
                        var placeID = $(this).attr('placeID');
                        getOrigin(placeID);
                    });
                } else {
                    app.f7.dialog.alert(data.status);
                    //  View.updateStatus(data.status)
                }
                console.log(data);
            }).error(function (error) {
                console.log(error);
                //   View.updateStatus(messages.server_error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {

            });
        }
    }

    function getOrigin(placeID) {
        app.f7.dialog.preloader('Getting your location');
        $.ajax({
            url: google.findPlace + placeID,
            timeout: 3000,
            method: 'GET'
        }).success(function (data) {
            console.log(data);
            locationPopup.close();
            getDestination({
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng
            });
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function onMapReady() {
        var map = this;
        map.animateCamera({
            target: {lat: -26.129903, lng: 28.105539},
            zoom: 10,
            tilt: 20,
            bearing: 140,
            duration: 1000
        }, function () {
            var option = {
                enableHighAccuracy: true, // use GPS as much as possible
                timeout: 3000
            };
            try {
                map.getMyLocation(option, locationSuccess.bind(map), positionError.bind(map));
            } catch (e) {

            }
        });

    }

    function getDestination(origin) {
        app.f7.dialog.preloader('Getting place details');
        $.ajax({
            url: google.findPlace + place_id,
            timeout: 3000,
            method: 'GET'
        }).success(function (data) {
            console.log(data);
            try {
                map.remove();
            } catch (e) {
            }
            loadRoutes(origin, {
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng
            });
        }).error(function (error) {
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function locationSuccess(location) {

        /*        map.addMarker({
                    position: location.latLng,
                    title: location.latLng.toUrlValue()
                }, function(marker) {
                    marker.showInfoWindow();
                });*/
        removeMaps();
        app.f7.dialog.close();
        getDestination({
            lat: location.latLng.lat,
            lng: location.latLng.lng
        });
    }

    function removeMaps() {
        $('#routes').show();
        try {
            map.remove();
        } catch (e) {
        }
        //       $('#routeMaps').hide();
    }

    function positionSuccess(position) {
        console.log(position);
        app.f7.dialog.close();
        //getRequiredLatandLng
        //get the place coordinates
        app.f7.dialog.preloader('Getting place details');
        $.ajax({
            url: google.findPlace + place_id,
            timeout: 3000,
            method: 'GET'
        }).success(function (data) {
            console.log(data);
            loadRoutes(position, data);
        }).error(function (error) {
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function loadRoutes(origin, destination) {
        app.f7.dialog.preloader('Getting routes');
        $.ajax({
            url: google.getRoutesByCoord(origin.lat + ',' + origin.lng, destination.lat + ',' + destination.lng),
            timeout: 3000,
            method: 'GET'
        }).success(function (data) {
            console.log(data);

            localStorage.setItem(cookienames.routes, JSON.stringify(data));
            View.fillRoutes(data);
            try {
                map.remove();
            } catch (e) {
            }
            $('#theRoutes').find('*#routeDetails').on('click', function () {
                var li = $(this).parents('li').index();
                app.mainView.router.navigate({
                    url: '/routedetails/' + li,
                    reloadPrevious: false
                });
            });
            $('#theRoutes').find('*#gotoRoute').on('click', function () {
                if (functions.hasCookie(cookienames.default_car)) {
                    var li = $(this).parents('li').index();
                    if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
                        app.f7.dialog.confirm('You have a pending journey that you haven`t finished/cancelled, please deal with this one first before you make another', function () {
                            //finish or cancel journey
                            app.mainView.router.navigate({
                                url: '/drive/' + Cookies.get(cookienames.position)
                            });
                        });
                    } else {
                        app.mainView.router.navigate({
                            url: '/drive/' + li,
                            reloadPrevious: false
                        });
                    }

                } else {
                    app.f7.dialog.confirm('You certainly have to choose a default car for your journeys, you can not proceed until you set us a default car', function () {
                        app.mainView.router.navigate('/cars');
                    });
                }

            });
        }).error(function (error) {
            console.log(error)
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function positionError(error) {
        app.f7.dialog.close();
        console.log(error);
        app.f7.dialog.confirm('Failed to auto pick your location, pick your location manually', function () {
            locationPopup.open();
            removeMaps();
        }, function () {
            app.mainView.router.back();
        });
    }

    return {
        init: init,
        onOut: onOut
    };
});