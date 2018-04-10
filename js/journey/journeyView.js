define(['hbs!js/journey/journey'], function (journeyTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillJourney(data) {
        $('#theJourney').html(journeyTemplate(data));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillJourney: fillJourney
    };
});

