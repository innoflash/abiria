define(["app", "js/car/carView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var car = {};
    var _id = 0;

    var bindings = [
        {
            element: '#editCar',
            event: 'click',
            handler: editCar
        }, {
            element: '#removeCar',
            event: 'click',
            handler: removeCar
        }, {
            element: '#makeDefault',
            event: "click",
            handler: makeDefault
        }, {
            element: '#carOptions',
            event: "click",
            handler: openOptions
        }
    ];

    function editCar() {
        app.mainView.router.navigate({
            url: '/editcar/' + _id,
            reloadPrevious: false
        });
    }

    function removeCar() {
        app.f7.dialog.confirm('Are you sure you want to remove this car from your cars', function (e) {
            app.f7.dialog.preloader('Removing car');
            $.ajax({
                url: app_apis.abiri + 'abiri-deletecar',
                method: 'POST',
                timeout: 3000,
                data: {
                    driver_id: user.id,
                    car_id: _id,
                    email: user.email,
                    phone: user.phone
                }
            }).success(function (data) {
                app.f7.dialog.alert(data.message, function () {
                    if (data.success == 1) {
                        //if set to default remove default cookies
                        var default_car = Cookies.getJSON(cookienames.default_car);
                        if (_id == car.id) {
                            Cookies.remove(cookienames.default_car);
                        }
                        app.mainView.router.back({
                            force: true,
                            ignoreCache: true
                        });
                    }
                });
            }).error(function (error) {
                console.log(error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        });
    }

    function makeDefault() {
        app.f7.dialog.confirm('You want to se this car as your default car?', function () {
            Cookies.set(cookienames.default_car, car);
            app.mainView.router.back({
                url: '/index',
                force: true,
                ignoreCache: true
            });
        });
    }

    function openOptions() {
        carOptions.open();
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /* try {
             app.f7.dialog.close();
         } catch (e) {
         }*/
        console.log('add car outting');
    }

    function reinit() {
        console.log('reinitialising');
        init();
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        _id = app.mainView.router.currentRoute.params.id;
        var cars = JSON.parse(localStorage.getItem(cookienames.cars));
        car = cars.filter(function (data) {
            return _id.indexOf(data.id) > -1
        });
        car = car[0];
        console.log(car);
        View.fillCar(car);
        carOptions = app.f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Options',
                        label: true
                    },
                    {
                        text: 'Edit',
                        bold: true,
                        onClick: function () {
                            editCar();
                        }
                    },
                    {
                        text: 'Remove',
                        bold: true,
                        onClick: function () {
                            removeCar();
                        }
                    },
                    {
                        text: 'Make Default',
                        bold: true,
                        onClick: function () {
                            makeDefault();
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

        loadCarJourneys(car);
    }

    function loadCarJourneys(car) {
        app.f7.dialog.preloader('Getting journeys');
        $.ajax({
            url: api.get('carjourneys'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                car_id: car.id,
                email: user.email,
                phone: user.phone
            }
        }).success(function (journeys) {
            console.log(journeys);
            if (journeys.data.length == 0) {
                app.f7.dialog.alert('This car does not have any journeys on it as yet');
            } else {
                View.fillJourneys(journeys);
            }
        }).error(function () {
            console.log(error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});