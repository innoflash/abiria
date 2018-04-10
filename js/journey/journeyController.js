define(["app", "js/journey/journeyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var id = 0;

    var bindings = [
        {
            element: '#journeyOptions',
            event: 'click',
            handler: journeyOptions
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        id = app.mainView.router.currentRoute.params.id;
        myOptions = app.f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Journey Options',
                        label: true
                    },
                    {
                        text: 'View Map',
                        bold: true,
                        onClick: function () {
                            viewMap();
                        }
                    }
                    /*             {
                                     text: 'Toll History',
                                     bold: true,
                                     onClick: function () {
                                         tollHistory();
                                     }
                                 }*/
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
        loadJourney(id);
    }

    function loadJourney(id) {
        app.f7.dialog.preloader('Loading journey');
        $.ajax({
            url: app_apis.abiri + 'abiri-getjourney',
            method: 'POST',
            timeout: 3000,
            data: {
                id: id
            }
        }).success(function (journey) {
            console.log(journey);
            localStorage.setItem(cookienames.journey, JSON.stringify(journey.data.route));
            View.fillJourney(journey);
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }


    function journeyOptions() {
        myOptions.open();
    }

    function viewMap() {
        $('#mapLink').get(0).click();
    }

    function tollHistory() {
        $('#tollLink').get(0).click();
        //   app.mainView.router.navigate('/tollhistory/' + id);
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('journey outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});