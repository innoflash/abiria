define([
    'hbs!js/convoydrive/members',
    'hbs!js/convoydrive/locationDetails',
    'hbs!js/convoydrive/geocode',
    'hbs!js/drive/tollgates',
    'hbs!js/drive/tolldetails',
    'hbs!js/drive/consumption'
], function (membersTemplate,
             locationTemplate,
             geocodeTemplate,
             tollgatesTemplate,
             tollgateTemplate,
           consumptionTemplate) {
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

    function fillTollgates(tollgates, tollCallback) {
        $('#tripTollgates').html(tollgatesTemplate(tollgates));
        if (typeof tollCallback === 'function')
            tollCallback(tollgates);
    }

    function fillTollgate(tollgate, tollCallback) {
        $('#mytollDetails').html(tollgateTemplate(tollgate));
        if (typeof tollCallback === 'function')
            tollCallback(tollgate);
    }

    function fillConsumption(consumption) {
        $('#consumptionEstimates').html(consumptionTemplate(consumption));
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
        fillGeocode: fillGeocode,
        fillTollgates: fillTollgates,
        fillTollgate: fillTollgate,
        fillConsumption: fillConsumption
    };
});
