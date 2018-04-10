define(['hbs!js/rank/routes'], function (routesTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillRoutes(routes) {
        $('#ranks').html(routesTemplate(routes));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillRoutes: fillRoutes
    };
});

