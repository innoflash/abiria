define(['hbs!js/journeys/journeys', 'hbs!js/journeys/blank'], function (journeysTemplate, blankTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function updateStatus(status) {
        $('#status').text(status);
    }

    function showBlank() {
        $('#journeys').html(blankTemplate);
    }

    function filljourneys(data) {
        $('#journeys').html(journeysTemplate(data));
    }

    function appendJourneys(data) {
        $('#moreJourneys').append(journeysTemplate(data));
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        updateStatus: updateStatus,
        filljourneys: filljourneys,
        showBlank: showBlank,
        appendJourneys: appendJourneys
    };
});
