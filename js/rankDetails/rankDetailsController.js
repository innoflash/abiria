define(["app", "js/rankDetails/rankDetailsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var position = -1;
    var data = {};
    var route = {};

    var bindings = [
        {
            element: '#moreRankOptions',
            event: 'click',
            handler: moreRankOptions
        }
    ];

    function moreRankOptions() {
        app.mainView.router.navigate({
            url: '/rankRoute/' + position
        });
    }

    function preparePage() {
        position = app.mainView.router.currentRoute.params.position;
        data = JSON.parse(localStorage.getItem(cookienames.rankRoutes));
        route = data.routes[position];
        View.fillDestination('To Taxi Rank');
        View.fillRoute(route.summary);
        View.fillDetails(route);
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('rankDetails outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: function () {

        }
    };
});