define(["hbs!js/taxiranks/places", "hbs!js/taxiranks/description"], function (placesTemplate, descriptionTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillPlaces(places) {
        $('#originSuggests2').html(placesTemplate(places));
    }

    function fillDescription(description) {
        $('#rankDescription').html(descriptionTemplate(description));
    }


    function emptyPlaces() {
        $('*#originSuggests2').html('');
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillPlaces: fillPlaces,
        emptyPlaces: emptyPlaces,
        fillDescription: fillDescription
    };
});

