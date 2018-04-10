define(['hbs!js/drive/tolldetails'], function (tollgateTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillTollgate(tollgate) {
        $('#mytollDetails').html(tollgateTemplate(tollgate));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillTollgate: fillTollgate
    };
});

