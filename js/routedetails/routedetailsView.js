define(['hbs!js/routedetails/details'], function (detailsTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillDestination(destination) {
        $("*#toDestination").text('To ' + destination);
    }

    function fillRoute(route) {
        $('*#viaRoute').text('via ' + route);
    }

    function fillSteps(data) {
        $('*#myRoutes').html(detailsTemplate(data));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillDestination: fillDestination,
        fillRoute: fillRoute,
        fillSteps: fillSteps
    };
});

