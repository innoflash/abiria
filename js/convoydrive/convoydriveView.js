define([
    'hbs!js/convoydrive/members',
    'hbs!js/convoydrive/locationDetails',
    'hbs!js/convoydrive/geocode',
], function (
    membersTemplate,
    locationTemplate,
    geocodeTemplate
    ) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillMembers(members) {
        $('#convoyPals').html(membersTemplate(members));
    }

    function fillLocationDetails(locationData, mapCallback) {
        $('#locationDetails').html(locationTemplate(locationData));
        if (typeof mapCallback === 'function') {
            mapCallback(locationData);
        }
    }

    function fillGeocode(data, geocodeCallback) {
        $('#geocodeDetails').html(geocodeTemplate(data));
        if (typeof geocodeCallback === 'function')
            geocodeCallback(data);
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillMembers: fillMembers,
        fillLocationDetails: fillLocationDetails,
        fillGeocode: fillGeocode
    };
});

