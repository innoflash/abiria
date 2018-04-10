define(["app", "js/taxiranks/taxiranksView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var locationPopup = {};
    var latLng = {};
    var map = {};

    var bindings = [
        {
            element: '#newLocation',
            event: 'click',
            handler: newLocation
        }
    ];

    function newLocation() {
        app.f7.dialog.confirm('Do you wanna chose a new location to find ranks from?', function () {
            console.log('will choose a location');
            locationPopup.open();
        });
    }

    function preparePage() {
        app.f7.dialog.preloader('Getting your location');
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
        var option = {
            enableHighAccuracy: true, // use GPS as much as possible
            timeout: 3000
        };
        try {
            plugin.google.maps.LocationService.getMyLocation(option, locationSuccess.bind(this), locationError.bind(this));
        } catch (e) {
        }
    }

    function locationSuccess(location) {
        app.f7.dialog.close();
        drawMap(location.latLng);
    }

    function locationError(error) {
        app.f7.dialog.close();
        console.log(error);
        app.f7.dialog.confirm('Failed to auto pick your location, pick your location manually', function () {
            locationPopup.open();
        }, function () {
            app.mainView.router.back();
        });
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
                    $('*#getLocation2').on('click', function () {
                        var placeID = $(this).attr('placeID');
                        getOrigin(placeID);
                    });
                } else {
                    app.f7.dialog.alert(data.status);
                }
                console.log(data);
            }).error(function (error) {
                console.log(error);
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
            console.log(data);
            drawMap(data.result.geometry.location);
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function drawMap(latLngs) {
        var div = document.getElementById("rank_canvas");
        latLng = latLngs;
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
        map.one(plugin.google.maps.event.MAP_READY, onMapReady);
        console.log(latLngs);
    }

    function onMapReady() {
        map.animateCamera({
            target: latLng,
            zoom: 13,
            tilt: 20,
            bearing: 140,
            duration: 3500
        }, function () {
            map.addMarker({
                position: latLng,
                title: 'My Current',
                snippet: 'position',
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {
                marker.setIcon("blue");
                marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                    marker.showInfoWindow();
                });

                // circle the area
                map.addCircle({
                    'center': latLng,
                    'radius': +Cookies.get(cookienames.rank_radius) * 1000,
                    'strokeColor': '#1821ff',
                    'strokeWidth': 3,
                    'fillColor': '#911750'
                }, function (circle) {
                    map.moveCamera({
                        target: circle.getBounds()
                    }, function () {
                        populateTaxiRanks();
                    });
                });
            });
        });
    }

    function populateTaxiRanks() {
        var hasRanks = Cookies.get(cookienames.has_taxi_ranks);
        if (hasRanks == true || hasRanks == "true") {
            showRanks();
        } else {
            getRanks();
        }
    }

    function showRanks() {
        var ranks = JSON.parse(localStorage.getItem(cookienames.taxi_ranks));
        app.f7.alert(JSON.stringify(ranks));
        ranks.forEach(function (rank) {
            map.addMarker({
                position: makeCoords(rank.coordinates),
                title: rank.name,
                snippet: 'taxi rank',
                animation: plugin.google.maps.Animation.BOUNCE
            }, function (marker) {
                marker.showInfoWindow();
                marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                    promptWalk(rank);
                });
                marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                    promptWalk(rank);
                });
            });
        });
    }

    function promptWalk(rank) {
        app.f7.dialog.confirm('Do you want to get directions to this taxi rank?', function () {
            console.log('will load the routes to the given coords from the current')
            app.mainView.router.navigate({
                url: '/rank/' + latLng + '/' + rank.coordinates,
                reloadPrevious: false
            });
        });
    }

    function makeCoords(latLng) {
        var coords = latLng.split(',');
        return {
            lat: +coords[0],
            lng: +coords[1]
        };
    }

    function getRanks() {
        app.f7.dialog.preloader('Getting ranks');
        $.ajax({
            url: app_apis.abiri + 'abiri-taxiranks',
            timeout: 3000,
            method: 'POST'
        }).success(function (taxiRanks) {
            localStorage.setItem(cookienames.taxi_ranks, JSON.stringify(taxiRanks));
            Cookies.set(cookienames.has_taxi_ranks, true, {
                expires: 21
            });
            app.f7.dialog.alert('Taxi ranks updated!', function () {
                showRanks();
            });
        }).error(function () {
            console.log(error);
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

    function onOut() {
        /*app.f7.dialog.close();*/
        try {
            map.remove();
        } catch (e) {
        }
        console.log('taxiranks outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});