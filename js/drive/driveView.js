define([
    'hbs!js/drive/tolldetails',
    'hbs!js/drive/tollgates',
    'hbs!js/drive/consumption'], function (tollgateTemplate, tollgatesTemplate, consumptionTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillTollgate(tollgate, tollCallback) {
        $('#mytollDetails').html(tollgateTemplate(tollgate));
        if(typeof tollCallback === 'function')
            tollCallback(tollgate);
    }

    function fillTollgates(tollgates, tollCallback) {
        $('#tripTollgates').html(tollgatesTemplate(tollgates));
        if(typeof tollCallback === 'function')
            tollCallback(tollgates);
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
        fillTollgates: fillTollgates,
        fillTollgate: fillTollgate,
        fillConsumption: fillConsumption
    };
});

