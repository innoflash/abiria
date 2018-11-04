define([
    'hbs!js/convoy/convoy'
], function (convoyTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillConvoy(convoy) {
        $('#convoyDetails').html(convoyTemplate(convoy));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillConvoy: fillConvoy
    };
});
