define([
    'hbs!js/addconvoy/places',
    'hbs!js/addconvoy/breaks',
    'hbs!js/addconvoy/member',
    'hbs!js/addconvoy/invited'
], function (placesTemplate,
             breaksTemplate,
             memberTemplate,
             invitedTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillSearchMembers(members) {
        $('#memberSuggests').html(memberTemplate(members));
    }

    function fillBreaks(breaks) {
        $('#breakPoints').html(breaksTemplate(breaks));
    }

    function fillPlaces(places) {
        $('#pointSuggests').html(placesTemplate(places));
    }

    function fillInvitedMembers(members) {
        $('#convoyMembers').html(invitedTemplate(members));
    }

    return {
        render: render,
        fillPlaces: fillPlaces,
        fillBreaks: fillBreaks,
        fillSearchMembers: fillSearchMembers,
        fillInvitedMembers: fillInvitedMembers
    };
});

