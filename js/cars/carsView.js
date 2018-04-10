define(['hbs!js/cars/cars', 'hbs!js/cars/blank'], function (carsTemplate, blankTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillCars(data) {
        $('#cars').html(carsTemplate(data));
    }

    function fillBlank() {
        $('#cars').html(blankTemplate);
    }

    function updateStatus(status) {
        $('#status').text(status);
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillCars: fillCars,
        showBlank: fillBlank,
        updateStatus: updateStatus
    };
});

