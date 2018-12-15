define(["app", "js/convoydrive/convoydriveView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [
        {
            element: '#convoyDriveOptions',
            event: 'click',
            handler: convoyDriveOptions
        }
    ];

    function convoyDriveOptions() {
        console.log('will pop up drive options');
        var buttons = [
            [
                {
                    text: 'Convoy Options',
                    label: true
                },
                {
                    text: 'Drive',
                    bold: true,
                    onClick: function () {
                        drive();
                    }
                },
                {
                    text: 'Members',
                    onClick: function () {
                        membersPopup.open();
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
        ];
        if (convoy.initiator.id === user.id) {
            buttons[0].push({
                text: 'End Convoy',
                onClick: function () {
                    endJourney();
                }
            });
        }
        app.f7.actions.create({
            buttons: buttons
        }).open();
    }

    function drive() {
        console.log('is driving');
    }

    function endJourney() {
        app.f7.dialog.preloader('Ending convoy...');
        $.ajax({
            url: api.getPath('decideconvoy'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id,
                convoy_id: convoy_id,
                decision: 'end'
            }
        }).success(function (response) {
            console.log(response);
            app.f7.dialog.alert(response.message, function () {
                if (response.success) {
                    app.mainView.router.back();
                }
            });
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy = JSON.parse(localStorage.getItem(cookienames.convoyObject));
        console.log(user);
        console.log(convoy);
        openMap();

        membersPopup = app.f7.popup.create({
            el: '.popup-members',
            on: {
                open: function () {
                    console.log('popup opened');
                    View.fillMembers(convoy.invites.data);
                    $('*#memberIntel').on('click', function () {
                        var user_id = $(this).attr('member_id');
                        console.log(user_id, user.id);
                        if (user_id != user.id) {
                            membersPopup.close();
                            navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
                                locationError.bind(this),
                                {
                                    maximumAge: 3000,
                                    timeout: 5000,
                                    enableHighAccuracy: true
                                });
                        }
                    });
                }
            }
        });
    }

    function locationSuccess(position) {
        console.log(position);
    }

    function locationError(error) {
        console.log(error);
        app.f7.dialog.confirm('Couldn`t pick your location right now, would you wanna try again?', function () {
            navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
                locationError.bind(this),
                {
                    maximumAge: 3000,
                    timeout: 5000,
                    enableHighAccuracy: true
                });
        });
    }

    function openMap() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        map = new GoogleMap(makeCoords(convoy.departure.coordinates), makeCoords(convoy.destination.coordinates));
        map.initialize();
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

            var map = new google.maps.Map(document.getElementById("convoyDriveMap"), mapOptions);
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
            if (status === 'OK') {
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

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*        try {
                    app.f7.dialog.close();
                } catch (e) {
                }*/
        console.log('convoydrive outting');
    }

    function reinit() {
        console.log('reinitialising');
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});