define([
    'hbs!js/editconvoy/convoy',
    'hbs!js/editconvoy/places',
    'hbs!js/editconvoy/breaks',
    'hbs!js/editconvoy/invited',
    'hbs!js/editconvoy/member',
], function (convoyTemplate, placesTemplate, breaksTemplate, invitedTemplate, memberTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillConvoy(convoy) {
        $('#editConvoyDetails').html(convoyTemplate(convoy));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillPlaces(places) {
        $('#editPointSuggests').html(placesTemplate(places));
    }

    function fillBreaks(breaks) {
        $('#editBreakPoints').html(breaksTemplate(breaks));
    }

    function fillInvitedMembers(members) {
        $('#convoyMembers').html(invitedTemplate(members));
    }

    function fillSearchMembers(members) {
        $('#editMemberSuggests').html(memberTemplate(members));
    }

    return {
        render: render,
        fillConvoy: fillConvoy,
        fillPlaces: fillPlaces,
        fillBreaks: fillBreaks,
        fillInvitedMembers: fillInvitedMembers,
        fillSearchMembers: fillSearchMembers
    };
});

