define(["hbs!js/taxiranks/places"], function (placesTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillPlaces(places) {
        $('#originSuggests').html(placesTemplate(places));
    }


    function emptyPlaces() {
        $('*#originSuggests').html('');
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillPlaces: fillPlaces,
        emptyPlaces: emptyPlaces
    };
});

