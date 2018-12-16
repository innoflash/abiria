define(["app", "js/addconvoy/addconvoyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var locationOpener, car = null;
    var breakPoints = [];
    var membersInvited = [];

    var bindings = [
        {
            element: '#addBreak',
            event: 'click',
            handler: addBreak
        }, {
            element: '#createConvoy',
            event: 'click',
            handler: createConvoy
        }, {
            element: '#addMember',
            event: 'click',
            handler: addMember
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        initPopups();

        $('#departure_venue').on('focus', function (e) {
            locationPopup.open();
            locationOpener = 'departure';
        });
        $('#destination_venue').on('focus', function (e) {
            locationPopup.open();
            locationOpener = 'destination';
        });

        $('#pointSearch').on('keyup', function () {
            searchPlaces();
        });

        if (!functions.hasCookie(cookienames.default_car)) {
            app.f7.dialog.confirm('Hi ', user.first_name + ', please be advised that you need to have a default car set' +
                ' for this journey, would you like to set one before you continue?', function () {
                app.mainView.router.navigate('/cars');
            }, function () {
                app.mainView.router.back();
            });
        } else {
            car = JSON.parse(Cookies.get(cookienames.default_car));
            console.log(car);
        }
    }

    function addBreak() {
        $('#addBreak').unbind();
        locationOpener = 'breaks';
        locationPopup.open();
    }

    function addMember() {
        memberPopup.open();

        $('#memberSearch').on('keyup', function () {
            memberSearch($(this).val());
        });
    }

    function memberSearch(details) {
        console.log(details);
        if (details.length > 2) {
            $.ajax({
                url: api.getPath('searchmember'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    phone: user.phone,
                    email: user.email,
                    user_id: user.id,
                    data: details
                }
            }).success(function (members) {
                console.log(members);
                View.fillSearchMembers(members.data);
                $('*#chooseMember').on('click', function () {
                    var memberIndex = $(this).attr('index');
                    app.f7.dialog.confirm('Dou you wanna invite ' + members.data[memberIndex].name + ' to this convoy??', function () {
                        membersInvited = membersInvited.filter(function (member) {
                            return member.id !== members.data[memberIndex].id;
                        });
                        membersInvited.push(members.data[memberIndex]);
                        initializeInvites(membersInvited);
                        memberPopup.close();
                    });
                });
            }).error(function (error) {
                console.log(error);
                app.f7.toast.create({
                    text: messages.server_error,
                    closeTimeout: 2000,
                }).open();
            });
        }
    }

    function initializeInvites(members) {
        View.fillInvitedMembers(members);
        $('*#removeMember').on('click', function () {
            var theIndex = $(this).attr('index');
            membersInvited = members.filter(function (member) {
                return member !== members[theIndex];
            });
            View.fillInvitedMembers(membersInvited);
            initializeInvites(membersInvited);
        });
    }

    function createConvoy() {
        var VF = [
            $('#departure_venue'),
            $('#departure_coordinates'),
            $('#destination_coordinates'),
            $('#destination_venue'),
            $('#date'),
            $('#timepicker'),
            $('#purpose')
        ];
        if (functions.isFieldsValid(VF, app)) {
            if (membersInvited.length == 0) {
                app.f7.dialog.alert(messages.empty_invite);
                return;
            }
            app.f7.dialog.preloader('Creating convoy...');
            $.ajax({
                url: api.getPath('createconvoy'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    phone: user.phone,
                    email: user.email,
                    user_id: user.id,
                    car_id: car.id,
                    departure: {
                        venue: $('#departure_venue').val(),
                        coordinates: $('#departure_coordinates').val()
                    },
                    destination: {
                        venue: $('#destination_venue').val(),
                        coordinates: $('#destination_coordinates').val()
                    },
                    date_time: {
                        date: $('#date').val(),
                        time: $('#timepicker').val()
                    },
                    purpose: $('#purpose').val(),
                    breakPoints: JSON.stringify(breakPoints),
                    members: membersInvited
                }
            }).success(function (data) {
                console.log(data);
                app.f7.dialog.alert(data.message, function () {
                    if (data.success) {
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
    }

    function searchPlaces() {
        if ($("#pointSearch").val().length >= 4) {
            $.ajax({
                url: google.findPlaces($('#pointSearch').val()),
                timeout: appDigits.timeout,
                method: 'GET'
            }).success(function (data) {
                console.log(data);
                if (data.status == 'OK') {
                    View.fillPlaces(data);
                    $('*#getPoint').on('click', function () {
                        placeID = $(this).attr('placeID');
                        description = $(this).attr('description');
                        geocodePoint(placeID, description);
                    });
                } else {
                    app.f7.toast.create({
                        text: data.status,
                        closeTimeout: 2000,
                    }).open();
                }
                console.log(data);
            }).error(function (error) {
                console.log(error);
                app.f7.toast.create({
                    text: messages.server_error,
                    closeTimeout: 2000,
                }).open();
            });
        }
    }

    function geocodePoint(placeID, description) {
        app.f7.dialog.preloader('Geocoding ' + description);
        $.ajax({
            url: google.findPlace + placeID,
            timeout: appDigits.timeout,
            method: 'GET'
        }).success(function (data) {
            console.log(data);
            if (data.status == 'OK') {
                if (locationOpener == 'departure') {
                    $('#departure_venue').val(description);
                    $('#departure_coordinates').val(data.result.geometry.location.lat + "," + data.result.geometry.location.lng);
                } else if (locationOpener == 'destination') {
                    $('#destination_venue').val(description);
                    $('#destination_coordinates').val(data.result.geometry.location.lat + "," + data.result.geometry.location.lng);
                } else {
                    var coordinates = data.result.geometry.location.lat + "," + data.result.geometry.location.lng
                    breakPoints = breakPoints.filter(function (breakPoint) {
                        console.log(breakPoint.coordinates + " : " + coordinates);
                        return breakPoint.coordinates !== coordinates;
                    });
                    breakPoints.push({
                        description: description,
                        coordinates: coordinates
                    });
                    initializeBreaks(breakPoints);
                }
                locationPopup.close();
            } else {
                app.f7.toast.create({
                    text: data.status,
                    closeTimeout: 2000,
                }).open();
            }
        }).error(function (error) {
            app.f7.toast.create({
                text: messages.server_error,
                closeTimeout: 2000,
            }).open();
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function initializeBreaks(breaks) {
        View.fillBreaks(breaks);
        $('*#removeBreak').on('click', function () {
            var theIndex = $(this).attr('index');
            breakPoints = breaks.filter(function (breakPoint) {
                return breakPoint !== breaks[theIndex];
            });
            View.fillBreaks(breakPoints);
            initializeBreaks(breakPoints);
        });
    }

    function initPopups() {
        locationPopup = app.f7.popup.create({
            el: '.popup-convoy',
            animation: true,
            on: {
                close: function () {
                    $('#pointSuggests').html('');
                    $('#pointSearch').val('');
                },
                open: function () {
                    $('#pointSearch').focus();
                    console.log('open triggered')
                }
            }
        });

        memberPopup = app.f7.popup.create({
            el: '.popup-members',
            animation: true,
            on: {
                close: function () {
                    $('#memberSuggests').html('');
                    $('#memberSearch').val('');
                },
                open: function () {
                    $('#memberSearch').focus();
                }
            }
        });

        app.f7.calendar.create({
            inputEl: '.convoy-date',
            animate: true,
            closeOnSelect: true
        });

        $('#timepicker').mdtimepicker();
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        console.log('addconvoy outting');
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