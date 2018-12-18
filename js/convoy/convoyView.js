define([
    'hbs!js/convoy/convoy',
    'hbs!js/convoy/car',
    'hbs!js/drive/tollgates',
    'hbs!js/drive/tolldetails',
    'hbs!js/drive/consumption'
], function (convoyTemplate,
             carTemplate,
             tollgatesTemplate,
             tollgateTemplate,
           consumptionTemplate) {
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
        fillCar: fillCar,
        fillTollgates: fillTollgates,
        fillTollgate: fillTollgate,
        fillConsumption: fillConsumption
    };
});
