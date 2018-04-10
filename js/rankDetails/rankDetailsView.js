define(['hbs!js/rankDetails/details'], function (detailsTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillDetails(data) {
        $('#myRankRoutes').html(detailsTemplate(data));
    }

    function fillDestination(destination) {
        $("*#toDestination").text('To ' + destination);
    }

    function fillRoute(route) {
        $('*#viaRoute').text('via ' + route);
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillDetails: fillDetails,
        fillDestination: fillDestination,
        fillRoute: fillRoute
    };
});

