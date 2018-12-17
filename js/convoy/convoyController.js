define(["app", "js/convoy/convoyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var car = null;

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
        invite_id = app.mainView.router.currentRoute.params.invite_id;
        console.log(convoy_id);
        initPopups();
        loadConvoy();
    }

    function initPopups() {
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

        acceptPopup = app.f7.popup.create({
            el: '.popup-accept',
            animate: true,
            on: {
                open: function () {
                    $('#accept_otp').val('');
                    $('#accept_otp').focus();

                    $('#btnAcceptInvite').unbind();
                    $('#btnAcceptInvite').on('click', function () {
                        var VF = [$('#accept_otp')];
                        if (functions.isFieldsValid(VF, app)) {
                            app.f7.dialog.preloader('Accepting your invite...');
                            $.ajax({
                                url: api.getPath('acceptconvoy'),
                                timeout: appDigits.timeout,
                                method: 'POST',
                                data: {
                                    phone: user.phone,
                                    email: user.email,
                                    user_id: user.id,
                                    invite_id: invite_id,
                                    otp: $('#accept_otp').val(),
                                    car_id: car.id
                                }
                            }).success(function (response) {
                                console.log(response);
                                app.f7.dialog.alert(response.message, function () {
                                    if (response.success) {
                                        acceptPopup.close();
                                        if (convoy.state.convoy === 'started') {
                                            app.mainView.router.navigate('/convoydrive');
                                        } else {
                                            init();
                                        }
                                    }
                                })
                            }).error(function (error) {
                                console.log(error);
                                app.f7.dialog.alert(messages.server_error);
                            }).always(function () {
                                app.f7.dialog.close();
                            });
                        }
                    });

                    $('#resendOTP').unbind();
                    $('#resendOTP').on('click', function () {
                        app.f7.dialog.confirm('You didn`t receive you OTP as an SMS and you want to request for another one right?', function () {
                            app.f7.dialog.preloader('Requesting OTP...');
                            $.ajax({
                                url: api.getPath('convoy-otp'),
                                method: 'POST',
                                timeout: appDigits.timeout,
                                data: {
                                    phone: user.phone,
                                    email: user.email,
                                    user_id: user.id,
                                    invite_id: invite_id
                                }
                            }).success(function (response) {
                                console.log(response);
                                app.f7.dialog.alert(response.message);
                            }).error(function (error) {
                                console.log(error);
                                app.f7.dialog.alert(messages.server_error);
                            }).always(function () {
                                app.f7.dialog.close();
                            });
                        });
                    });
                }
            }
        });
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
                convoy_id: convoy_id,
                invite_id: invite_id,
            }
        }).success(function (cnvy) {
            console.log(cnvy);
            convoy = cnvy.data;
            View.fillConvoy(convoy, function () {
                console.log(Cookies.get(cookienames.default_car));
                if (!functions.hasCookie(cookienames.default_car)) {
                    View.fillCar(null);
                } else {
                    car = JSON.parse(Cookies.get(cookienames.default_car));
                    View.fillCar(car);
                }
            });
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
        var buttons = [
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
                }
            ],
            [
                {
                    text: 'Drive',
                    bold: true,
                    onClick: function () {
                        driveInConvoy();
                    }
                },
                {
                    text: 'Change car',
                    bold: true,
                    onClick: function () {
                        app.mainView.router.navigate('/cars');
                    }
                }
            ],
            [
                {
                    text: 'Cancel',
                    color: 'red'
                }
            ]
        ];
        if (user.id == convoy.initiator.id) {
            buttons[0].push({
                text: 'Edit',
                bold: true,
                onClick: function () {
                    editConvoy();
                }
            }, {
                text: 'Delete',
                bold: true,
                onClick: function () {
                    deleteConvoy();
                }
            });
            buttons.splice(1, 0, [
                {
                    text: 'Start/End',
                    bold: true,
                    onClick: function () {
                        toggleConvoy('toggle');
                    }
                },
                {
                    text: 'Cancel Convoy',
                    color: 'red',
                    bold: true,
                    onClick: function () {
                        toggleConvoy('cancel');
                    }
                }
            ]);
        } else {
            console.log('u are invited');
            buttons[0].push({
                    text: 'Accept',
                    bold: true,
                    onClick: function () {
                        acceptConvoy();
                    }
                },
                {
                    text: 'Decline',
                    bold: true,
                    color: 'red',
                    onClick: function () {
                        declineConvoy();
                    }
                });
        }
        cvyOptions = app.f7.actions.create({
            buttons: buttons
        });
    }

    function toggleConvoy(action) {
        if (action === 'cancel') {
            if (convoy.state === 'ended') {
                app.f7.dialog.alert('You can not cancel a convoy that`s already ended!');
            } else if (convoy.state === 'canceled') {
                app.f7.dialog.alert('You can not cancel a convoy that`s already canceled!');
            } else if (convoy.state === 'started') {
                app.f7.dialog.confirm('You can not cancel a convoy that`s already started, would you like to end it instead!', function () {
                    toggleConvoy('toggle');
                });
            } else {
                app.f7.dialog.preloader('Cancelling convoy ...');
                $.ajax({
                    url: api.getPath('cancelconvoy'),
                    method: 'POST',
                    timeout: appDigits.timeout,
                    data: {
                        phone: user.phone,
                        email: user.email,
                        user_id: user.id,
                        convoy_id: convoy_id
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
        } else {
            console.info('will do start and finish');
            if (convoy.state === 'ended') {
                app.f7.dialog.confirm('This convoy seems to have been ended, would you like to restart it if it was done by mistake?', function () {
                    decideConvoy('start');
                });
            } else if (convoy.state === 'canceled') {
                app.f7.dialog.confirm('This convoy is set to be canceled, do you wanna restart it?', function () {
                    decideConvoy('start');
                });
            } else if (convoy.state === 'started') {
                app.f7.dialog.confirm('This convoy seems to have been started, would you like to end it if it was done by mistake?', function () {
                    decideConvoy('end');
                });
            } else {
                decideConvoy('start');
            }
        }
    }

    function decideConvoy(decision) {
        app.f7.dialog.preloader('Please wait...');
        $.ajax({
            url: api.getPath('decideconvoy'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id,
                convoy_id: convoy_id,
                decision: decision
            }
        }).success(function (response) {
            console.log(response);
            app.f7.dialog.alert(response.message, function () {
                if (response.success) {
                    convoy = response.convoy;
                    convoy.invites = {};
                    convoy.invites.data = response.invites;
                    localStorage.setItem(cookienames.convoyObject, JSON.stringify(convoy));
                    console.log(convoy);
                    View.fillConvoy(convoy);
                    if (response.start) {
                        app.mainView.router.navigate('/convoydrive');
                    }
                }
            });
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function driveInConvoy() {
        if (convoy.state.invite === 'accepted' && convoy.state.convoy === 'started') {
            app.mainView.router.navigate('/convoydrive');
        } else if (convoy.state.invite !== 'accepted') {
            app.f7.dialog.confirm('You have not accepted the invite to this journey, would you like to do that now?', function () {
                acceptConvoy();
            });
        } else {
            if (convoy.state.convoy === 'canceled') {
                app.f7.dialog.alert('This convoy is canceled already, you can`t make it');
            } else if (convoy.state.convoy === 'ended') {
                app.f7.dialog.alert('This convoy is already recorded ended, you can`t drive into it');
            } else {
                if (convoy.initiator.id === user.id) {
                    app.f7.dialog.confirm('You are supposed to start this journey first before driving into it, would you like to start it right now?', function () {
                        decideConvoy('start');
                    });
                } else {
                    app.f7.dialog.confirm('This convoy is not yet yet started, would you like to remind ' + convoy.initiator.first_name + ' to start the convoy already?', function () {
                        sendReminder();
                    });
                }
            }
        }
    }

    function sendReminder() {
        app.f7.dialog.preloader('Sending your reminder...');
        $.ajax({
            url: api.getPath('convoyreminder'),
            timeout: appDigits.timeout,
            method: 'POST',
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id,
                convoy_id: convoy.id.convoy
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
            app.f7.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function acceptConvoy() {
        console.log('will accept invite');
        if (car === null) {
            app.f7.dialog.confirm('You do not have a car set for this convoy, would you wanna go to your list of cars ' +
                'and select the car you want? NB> just make it default so that Abiri can pick it up', function () {
                app.mainView.router.navigate('/cars');
            });
        } else {
            {
                if (convoy.state.invite !== 'accepted')
                    acceptPopup.open();
                else
                    app.f7.dialog.alert('You have already accepted this convoy invite');
            }
        }
    }

    function declineConvoy() {
        console.log('will decline convoy');
        app.f7.dialog.confirm('Are you sure you don`t wanna be part of this arranged convoy?', function () {
            app.f7.dialog.preloader('Declining invite...');
            $.ajax({
                url: api.getPath('declineconvoy'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    phone: user.phone,
                    email: user.email,
                    invite_id: invite_id
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
        });
    }

    function openMap(convoy) {
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
                    convoy_id: convoy.id.convoy,
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