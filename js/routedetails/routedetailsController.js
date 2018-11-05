define(["app", "js/routedetails/routedetailsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var position = 0;
    var data = {};
    var route = {};
    var car = {};

    var bindings = [
        {
            element: '#tabDrive',
            event: 'click',
            handler: drive
        },
        {
            element: '#tabTollgates',
            event: 'click',
            handler: tollgates
        }, {
            element: '#moreOptions',
            event: 'click',
            handler: moreOptions
        }
    ];

    function moreOptions() {
        myOptions.open();
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        car = Cookies.getJSON(cookienames.default_car);
        data = JSON.parse(localStorage.getItem(cookienames.routes));
        position = app.mainView.router.currentRoute.params.position;
        loadRoute();
        myOptions = app.f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Options',
                        label: true
                    },
                    {
                        text: 'Drive',
                        bold: true,
                        onClick: function () {
                            drive();
                        }
                    },
                    {
                        text: 'Choose Car',
                        bold: true,
                        onClick: function () {
                            app.mainView.router.navigate('/cars');
                        }
                    }
                ],
                // Second group
                [
                    {
                        text: 'Cancel',
                        color: 'red'
                    }
                ]
            ]
        });
    }

    function loadRoute() {
        console.log(data);

        View.fillDestination(data.routes[position].legs[0].end_address);
        View.fillRoute(data.routes[position].summary);
        View.fillSteps(data.routes[position]);
    }

    function tollgates() {
        //will load estimated tollgates
        console.log('load tollgates');
        route = data.routes[position];

    }


    function drive() {
        if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
            app.f7.dialog.confirm('You have a pending journey that you haven`t finished/cancelled, please deal with this one first before you make another', function () {
                //finish or cancel journey
                app.mainView.router.navigate({
                    url: '/drive/' + Cookies.get(cookienames.position)
                });
            });
        } else {
            if (functions.hasCookie(cookienames.default_car)) {
                app.mainView.router.navigate({
                    url: '/drive/' + position,
                    reloadCurrent: false,
                    reloadPrevious: false,
                    ignoreCache: false,
                    clearPreviousHistory: false
                });
            } else {
                app.f7.dialog.confirm('You certainly have to choose a default car for your journeys, you can not proceed until you set us a default car', function () {
                    app.mainView.router.navigate('/cars');
                });
            }
        }
    }


    function init() {
        preparePage();
        console.log(app);
        View.render({
            bindings: bindings
        });
    }


    function onOut() {
       /* app.f7.dialog.close();*/
        console.log('route details outting');
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});