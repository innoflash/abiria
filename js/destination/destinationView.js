define(['hbs!js/destination/places'], function (placesTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function updateStatus(status) {
        $('#status').text(status);
    }

    function fillPlaces(data) {
        $('#places').html(placesTemplate(data));
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        updateStatus: updateStatus,
        fillPlaces: fillPlaces
    };
});

