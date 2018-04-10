define(["app", "js/rank/rankView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var origin = 0;
    var destination = 0;

    var bindings = [];

    function preparePage() {
        origin = app.mainView.router.currentRoute.params.origin;
        destination = app.mainView.router.currentRoute.params.destination;
        app.f7.dialog.preloader('Getting routes');
        $.ajax({
            url: google.getWalkingDirections(origin, destination),
            timeout: 3000,
            method: 'GET'
        }).success(function (routes) {
            if (routes.status == "OK") {
                localStorage.setItem(cookienames.rankRoutes, JSON.stringify(routes));
                View.fillRoutes(routes);
                $('#theRoutes').find('*#rankRouteDetails').on('click', function () {
                    var li = $(this).parents('li').index();
                    app.mainView.router.navigate({
                        url: '/rankDetails/' + li,
                        reloadPrevious: false
                    });
                });
                $('#theRoutes').find('*#rankGotoRoute').on('click', function () {
                    var li = $(this).parents('li').index();
                    app.mainView.router.navigate({
                        url: '/rankRoute/' + li,
                        reloadPrevious: false
                    });
                });
            } else {
                app.f7.dialog.alert(routes.status, function () {
                    app.mainView.router.back();
                });
            }
        }).error(function (error) {
            app.f7.dialog.alert(messages.server_error, function () {
                app.mainView.router.back();
            });
        }).always(function () {
            app.f7.dialog.close();
        });
    }


    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('rank outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});