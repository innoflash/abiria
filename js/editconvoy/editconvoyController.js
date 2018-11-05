define(["app", "js/editconvoy/editconvoyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy = JSON.parse(localStorage.getItem(cookienames.convoyObject));
        console.log(convoy);
        View.fillConvoy(convoy);

        initPopups();

        $('#dep_venue').on('focus', function (e) {
            locationPopup.open();
            locationOpener = 'departure';
        });
        $('#dest_venue').on('focus', function (e) {
            locationPopup.open();
            locationOpener = 'destination';
        });

        $('#editPointSearch').on('keyup', function () {
            searchPlaces();
        });

        $('#convoy_purpose').on('keyup', function () {
            convoy.purpose = $(this).val();
        });

        $('#convoy_date').on('change', function () {
            convoy.time.date = $(this).val();
        });

        $('#addEditBreak').on('click', function () {
            locationOpener = 'breaks';
            locationPopup.open();
        });

        $('#addEditMember').on('click', function () {
            console.log('add member clicked');
            memberPopup.open();

            $('#editMemberSearch').on('keyup', function () {
                memberSearch($(this).val());
            });
        });

        $('#editConvoy').on('click', function () {
            editConvoy();
        });

        initializeBreaks(convoy.breaks);
        initializeInvites(convoy.invites.data);
    }

    function initializeBreaks(breaks) {
        View.fillBreaks(breaks);
        $('*#removeEditBreak').on('click', function () {
            var theIndex = $(this).attr('index');
            console.log(theIndex, breaks);
            convoy.breaks = breaks.filter(function (breakPoint) {
                return breakPoint !== breaks[theIndex];
            });
            View.fillBreaks(convoy.breaks);
            initializeBreaks(convoy.breaks);
        });
    }

    function initializeInvites(members) {
        View.fillInvitedMembers(members);
        $('*#removeEditMember').on('click', function () {
            var theIndex = $(this).attr('index');
            convoy.invites.data = members.filter(function (member) {
                return member !== members[theIndex];
            });
            View.fillInvitedMembers(convoy.invites.data);
            initializeInvites(convoy.invites.data);
        });
    }

    function editConvoy() {
        var VF = [
            $('#dep_venue'),
            $('#dep_coordinates'),
            $('#dest_coordinates'),
            $('#dest_venue'),
            $('#convoy_date'),
            $('#timepicker'),
            $('#convoy_purpose')
        ];
        if (functions.isFieldsValid(VF, app)) {
            if (convoy.invites.data.length == 0) {
                app.f7.dialog.alert(messages.empty_invite);
                return;
            }
            app.f7.dialog.preloader('Editing convoy...');
            $.ajax({
                url: api.getPath('editconvoy'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    phone: user.phone,
                    email: user.email,
                    user_id: user.id,
                    convoy: convoy,
                    breaks: JSON.stringify(convoy.breaks)
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
                        convoy.invites.data = convoy.invites.data.filter(function (member) {
                            return member.id !== members.data[memberIndex].id;
                        });
                        convoy.invites.data.push(members.data[memberIndex]);
                        initializeInvites(convoy.invites.data);
                        memberPopup.close();
                    });
                });
            }).error(function (error) {
                console.log(error);
                app.f7.toast.create({
                    text: messages.server_error,
                    closeTimeout: 2000
                }).open();
            });
        }
    }

    function searchPlaces() {
        if ($("#editPointSearch").val().length >= 4) {
            $.ajax({
                url: google.findPlaces($('#editPointSearch').val()),
                timeout: appDigits.timeout,
                method: 'GET'
            }).success(function (data) {
                console.log(data);
                if (data.status == 'OK') {
                    View.fillPlaces(data);
                    $('*#editGetPoint').on('click', function () {
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
                    $('#dep_venue').val(description);
                    $('#dep_coordinates').val(data.result.geometry.location.lat + "," + data.result.geometry.location.lng);
                    convoy.departure.venue = description;
                    convoy.departure.coordinates = $('#dep_coordinates').val();
                } else if (locationOpener == 'destination') {
                    $('#dest_venue').val(description);
                    $('#dest_coordinates').val(data.result.geometry.location.lat + "," + data.result.geometry.location.lng);
                    convoy.departure.venue = description;
                    convoy.departure.coordinates = $('#dest_coordinates').val();
                } else {
                    var coordinates = data.result.geometry.location.lat + "," + data.result.geometry.location.lng
                    convoy.breaks = convoy.breaks.filter(function (breakPoint) {
                        console.log(breakPoint.coordinates + " : " + coordinates);
                        return breakPoint.coordinates !== coordinates;
                    });
                    convoy.breaks.push({
                        description: description,
                        coordinates: coordinates
                    });
                    initializeBreaks(convoy.breaks);
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

    function initPopups() {
        locationPopup = app.f7.popup.create({
            el: '.popup-editconvoy',
            animation: true,
            on: {
                close: function () {
                    $('#editPointSuggests').html('');
                    $('#editPointSearch').val('');
                },
                open: function () {
                    $('#editPointSearch').focus();
                    console.log('open triggered')
                }
            }
        });

        memberPopup = app.f7.popup.create({
            el: '.popup-editmembers',
            animation: true,
            on: {
                close: function () {
                    $('#editMemberSuggests').html('');
                    $('#editMemberSearch').val('');
                },
                open: function () {
                    $('#editMemberSearch').focus();
                }
            }
        });

        app.f7.calendar.create({
            inputEl: '.convoy-date',
            animate: true,
            closeOnSelect: true
        });

        $('#timepicker').mdtimepicker().on('timechanged', function (e) {
            console.log(e.value);
            convoy.time.time = e.value;
        });
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        console.log('editconvoy outting');
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