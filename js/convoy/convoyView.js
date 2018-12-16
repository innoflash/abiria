define([
    'hbs!js/convoy/convoy',
    'hbs!js/convoy/car',
], function (convoyTemplate, carTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillConvoy(convoy, carCallback) {
        $('#convoyDetails').html(convoyTemplate(convoy));
        if (typeof carCallback === 'function') {
            carCallback();
        }
    }

    function fillCar(car) {
        console.log(car);
        $('#carChoice').html(carTemplate(car));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillConvoy: fillConvoy,
        fillCar: fillCar
    };
});
