define(["app", "js/convoydrive/convoydriveView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [

    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy = JSON.parse(localStorage.getItem(cookienames.convoyObject));
        console.log(user);
        console.log(convoy);
        openMap();
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