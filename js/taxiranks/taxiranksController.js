define(["app", "js/taxiranks/taxiranksView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var locationPopup = {};
    var cPosition = {};
    var map, mapBounds, cPosition = {};
    var positionCircle, currentPosition = null;
    var positionMarker, rankMarker, myMarker, selectedRank = null;

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
        positionMarker = 'img/icons/pedestrian.png';
        rankMarker = 'img/icons/tollgate.png';
        locationPopup = app.f7.popup.create({
            el: '.popup-mylocation2',
            animate: true,
            on: {
                open: function () {
                    app.f7.searchbar.create({
                        el: '.originSearchbar2'
                    });
                    $('#originSearch2').keyup(function () {
                        searchResults();
                    });
                }
            }
        });

        navigator.geolocation.getCurrentPosition(locationSuccess.bind(this),
            locationError.bind(this),
            {
                maximumAge: 3000,
                timeout: 5000,
                enableHighAccuracy: true
            });
    }

    function searchResults() {
        if ($$("#originSearch2").val().length >= 5) {
            $.ajax({
                url: google.findPlaces($('#originSearch2').val()),
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
            View.emptyPlaces();
            cPosition = data.result.geometry.location;
            console.log(cPosition);
            var thisPosition = new google.maps.LatLng(cPosition);
            try {
                positionCircle.setMap(null);
                myMarker.setMap(null);

                console.log(cPosition);
                pinMe(new google.maps.LatLng(cPosition));
            } catch (e) {
                var map = new GoogleMap(thisPosition);
                map.initialize();
                pinMe(thisPosition);
                // drawMap(data.result.geometry.location);
            }
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }


    function locationSuccess(position) {
        cPosition.lat = position.coords.latitude;
        cPosition.lng = position.coords.longitude;
        app.f7.dialog.close();
        currentPosition = new google.maps.LatLng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        });
        var map = new GoogleMap(currentPosition);
        map.initialize();
        console.log(cPosition);
        pinMe(currentPosition);
    }

    function pinMe(currentPosition) {
        map.setCenter(currentPosition);

        myMarker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            title: "current position",
            animation: google.maps.Animation.DROP,
            icon: positionMarker
        });
        positionCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: currentPosition,
            radius: +Cookies.get(cookienames.rank_radius) * 1000
        });
        console.log(positionCircle.getBounds());
        drawRanks(positionCircle.getBounds())
    }

    function drawRanks(bounds) {
        var hasRanks = Cookies.get(cookienames.has_taxi_ranks);
        app.f7.toast.create({
            text: 'Populating ranks',
            closeTimeout: 2000,
        }).open();

        if (Cookies.get(cookienames.has_taxi_ranks) == true || Cookies.get(cookienames.has_taxi_ranks) == "true") {
            // window.plugins.toast.showLongBottom('should be showing ranks right now');
            showRanks(bounds);
        } else {
            getRanks(bounds);
        }
    }

    function showRanks(bounds) {
        var ranks = JSON.parse(localStorage.getItem(cookienames.taxi_ranks));
        // app.f7.dialog.alert(JSON.stringify(ranks));
        ranks.forEach(function (rank, i) {
            if (bounds.contains(makeCoords(rank.coordinates))) {
                var rankIcon = new google.maps.Marker({
                    position: makeCoords(rank.coordinates),
                    map: map,
                    title: rank.name,
                    animation: google.maps.Animation.DROP
                });
                var div = document.createElement('div');
                div.innerHTML = rank.name;
                div.onclick = function () {
                    promptWalk();
                };

                var infowindow = new google.maps.InfoWindow({
                    content: div
                });
                rankIcon.addListener('click', function () {
                    selectedRank = rank;
                    infowindow.open(map, rankIcon);
                });
            }
        });
    }

    function promptWalk() {
        app.f7.dialog.confirm('Do you want to get directions to this taxi rank?', function () {
            console.log('will load the routes to the given coords from the current');
            app.mainView.router.navigate({
                //   url: '/rank/' + latLng.lat + ',' + latLng.lng + '/' + selectedRank.coordinates,
                url: '/rankRoute/' + selectedRank.name + '/' + cPosition.lat + ',' + cPosition.lng + '/' + selectedRank.coordinates,
                reloadPrevious: false
            });
        });
    }

    function makeCoords(latLng) {
        var coords = latLng.split(',');

        return new google.maps.LatLng({
            lat: +coords[0],
            lng: +coords[1]
        });
    }

    function getRanks(bounds) {
        app.f7.dialog.preloader('Getting ranks');
        $.ajax({
            url: app_apis.abiri + 'abiri-taxiranks',
            timeout: 3000,
            method: 'POST',
            data: {
                phone: user.phone,
                email: user.email
            }
        }).success(function (taxiRanks) {
            localStorage.setItem(cookienames.taxi_ranks, JSON.stringify(taxiRanks));
            Cookies.set(cookienames.has_taxi_ranks, true, {
                expires: 21
            });
            app.f7.dialog.alert('Taxi ranks updated!', function () {
                showRanks(bounds);
            });
        }).error(function () {
            console.log(error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function GoogleMap(latLng) {
        mapDiv = $('#rank_canvas');
        this.initialize = function () {
            map = showMap();
        };

        var showMap = function () {
            var mapOptions = {
                zoom: 13,
                center: latLng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            };

            var map = new google.maps.Map(document.getElementById("rank_canvas"), mapOptions);
            return map;
        };
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


    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function reinit() {
        init();
        console.log('reinitialising');
    }

    function onOut() {
        console.log('taxiranks outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});