define(["app", "js/convoy/convoyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [
        {
            element: '#convoyOptions',
            event: 'click',
            handler: convoyOptions
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy_id = app.mainView.router.currentRoute.params.convoy_id;
        console.log(convoy_id);
        loadConvoy();
    }

    function convoyOptions() {
        cvyOptions.open();
    }

    function loadConvoy() {
        app.f7.dialog.preloader('Loading convoy details...');
        $.ajax({
            url: api.getPath('convoy'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                convoy_id: convoy_id
            }
        }).success(function (cnvy) {
            console.log(cnvy);
            convoy = cnvy.data;
            View.fillConvoy(convoy);
            initActions(convoy);
            localStorage.setItem(cookienames.convoyObject, JSON.stringify(convoy));
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error, function () {
                app.mainView.router.back();
            });
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function initActions(convoy) {
        console.log(convoy);
        if (user.id == convoy.driver_id) {
            cvyOptions = app.f7.actions.create({
                buttons: [
                    // First group
                    [
                        {
                            text: 'Convoy Options',
                            label: true
                        },
                        {
                            text: 'Map',
                            bold: true,
                            onClick: function () {
                                openMap(convoy);
                            }
                        },
                        {
                            text: 'Edit',
                            bold: true,
                            onClick: function () {
                                editConvoy();
                            }
                        },
                        {
                            text: 'Delete',
                            bold: true,
                            onClick: function () {
                                deleteConvoy();
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
        } else {
            console.log('u are invited');
        }
    }

    function openMap(convoy) {
        mapPopup = app.f7.popup.create({
            el: '.popup-convoymap',
            animate: true,
            on: {
                open: function () {
                    directionsService = new google.maps.DirectionsService();
                    directionsDisplay = new google.maps.DirectionsRenderer();

                    map = new GoogleMap(makeCoords(convoy.departure.coordinates), makeCoords(convoy.destination.coordinates));
                    map.initialize();
                },
                close: function () {

                }
            }
        });
        mapPopup.open();
    }

    function editConvoy() {
        app.mainView.router.navigate('/editconvoy');
    }

    function deleteConvoy() {
        app.f7.dialog.confirm('Are you sure you want to delete this convoy trip to ' + convoy.destination.description + "?", function () {
            app.f7.dialog.preloader('Deleting convoy...');
            $.ajax({
                url: api.getPath('deleteconvoy'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    phone: user.phone,
                    email: user.email,
                    convoy_id: convoy.id,
                    user_id: user.id
                }
            }).success(function (response) {
                console.info(response);
                app.f7.dialog.alert(response.message, function () {
                    if (response.success) {
                        app.mainView.router.back();
                    }
                });
            }).error(function (error) {
                console.error(error);
                app.f7.di.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        });
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function GoogleMap(origin, destination) {
        mapDiv = $('#convoyMap');
        this.initialize = function () {
            map = showMap();
        };

        var showMap = function () {
            console.log(midPoint(origin, destination));
            var mapOptions = {
                zoom: 12,
                center: midPoint(origin, destination),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                tilt: 45
            };

            var map = new google.maps.Map(document.getElementById("convoyMap"), mapOptions);
            directionsDisplay.setMap(map);
            calcRoute(directionsService, directionsDisplay, origin, destination, pinBreaks);
            return map;
        };
    }

    function calcRoute(directionsService, directionsDisplay, origin, destination, pinBreaks) {
        var request = {
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING'
        };
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(result);
                routeResult = result;
                pinBreaks(map);
            }
            console.log(result);
            console.log(status);
        });
    }

    var pinBreaks = function (map) {
        convoy.breaks.forEach(function (cBreak) {
            var marker = new google.maps.Marker({
                position: makeCoords(cBreak.coordinates),
                map: map,
                title: cBreak.description,
                animation: google.maps.Animation.DROP,
                //  label: tollgate.name,
            });
            var div = document.createElement('div');
            div.innerHTML = cBreak.description;

            var infowindow = new google.maps.InfoWindow({
                content: div
            });
            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
        });
    };

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

    function onOut() {
        console.log('convoy outting');
    }

    function reinit() {
        console.log('reinitialising');
        init();
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});