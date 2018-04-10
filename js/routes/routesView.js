define(['hbs!js/routes/routes', "hbs!js/routes/places"], function (routesTemplate, placesTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function updateStatus(status) {
        $('#status').text(status);
    }

    function fillRoutes(data) {
        $('#routes').html(routesTemplate(data));
    }

    function fillPlaces(places) {
        $('#originSuggests').html(placesTemplate(places));
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        updateStatus: updateStatus,
        fillRoutes: fillRoutes,
        fillPlaces: fillPlaces
    };
});

