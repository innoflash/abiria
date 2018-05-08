define(["app", "js/routes/routesView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var place_id = 0;
    var map = {};
    var locationPopup = {};

    var bindings = [];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        place_id = app.mainView.router.currentRoute.params.place_id;
        console.log(app.mainView.router.currentRoute.params);

        navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
            locationError.bind(this),
            {
                maximumAge: 3000,
                timeout: 5000,
                enableHighAccuracy: true
            });
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
    }

    function searchResults() {
        if ($$("#originSearch").val().length >= 5) {
            $.ajax({
                url: google.findPlaces($('#originSearch').val()),
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
                    window.plugins.toast.showShortTop(data.status);
                }
                console.log(data);
            }).error(function (error) {
                console.log(error);
                window.plugins.toast.showShortTop(messages.server_error);
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
            // View.emptyPlaces();
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

    function locationSuccess(position) {
        console.log(position);
        app.f7.dialog.close();
        getDestination({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        });
    }

    function locationError(error) {
        console.log(error);
        app.f7.dialog.close();
        app.f7.dialog.confirm('Failed to auto pick your location, pick your location manually', function () {
            locationPopup.open();
        }, function () {
            app.mainView.router.back();
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
            View.emptyPlaces();
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

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function reinit() {
        console.log('reinitialising routes2');
    }

    function onOut() {
        /* app.f7.dialog.close();
         console.log(app.f7.dialog);
         try {
             app.f7.dialog.close();
         } catch (e) {
         }*/
        console.log('routes2 outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});