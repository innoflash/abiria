define(['hbs!js/car/carDetails', 'hbs!js/car/journeys'], function (carTemplate, journeysTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillCar(data) {
        $('#carDetails').html(carTemplate(data));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillJourneys(data) {
        $('#carJourneys').html(journeysTemplate(data));
    }

    return {
        render: render,
        fillCar: fillCar,
        fillJourneys: fillJourneys
    };
});

