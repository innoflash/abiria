define(["app", "js/editcar/editcarView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var cars = {};
    var car = {};
    var id = 0;

    var bindings = [
        {
            element: '#reditCar',
            event: 'click',
            handler: editCar
        }
    ];

    function init(query) {
        id = app.mainView.router.currentRoute.params.id;
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
      /*  app.f7.dialog.close();*/
        console.log('edit car outting');
    }

    function reinit() {
        console.log('reinitialising');
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        cars = JSON.parse(localStorage.getItem(cookienames.cars));
        car = cars.filter(function (data) {
            return id.indexOf(data.id) > -1
        });
        car = car[0];
        console.log(car);
        View.fillImage();
        app.f7.picker.create({
            inputEl: '#vehicle_class',
            cols: [
                {
                    textAlign: 'center',
                    values: [
                        '1',
                        '2',
                        '3',
                        '4'
                    ]
                }
            ]
        });

        app.f7.picker.create({
            inputEl: '#car_weight',
            cols: [
                {
                    textAlign: 'center',
                    values: [
                        'Light',
                        'Medium',
                        'Heavy'
                    ]
                }
            ]
        });

        app.f7.picker.create({
            inputEl: '#car_fuel_type',
            cols: [
                {
                    textAlign: 'center',
                    values: [
                        'Petrol',
                        'Diesel'
                    ]
                }
            ]
        });

        $('#vehicle_brand').val(car.brand);
        $('#vehicle_model').val(car.model);
        $('#vehicle_class').val(car.car_class);
        $('#vehicle_reg').val(car.registration_number);
        $('#car_weight').val(car.weight);
        $('#car_fuel_type').val(car.fuel_type);
    }

    function editCar() {
        console.log('this button has been hit');
        var VF = [
            $('#vehicle_brand'),
            $('#vehicle_model'),
            $('#vehicle_class'),
            $('#vehicle_reg'),
            $('#car_weight'),
            $('#car_fuel_type'),
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Updating your car');
            $.ajax({
                url: api.getPath('editcar'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    id: car.id,
                    model: $('#vehicle_model').val(),
                    brand: $('#vehicle_brand').val(),
                    reg_num: $('#vehicle_reg').val(),
                    car_class: $('#vehicle_class').val(),
                    fuel_type: $('#car_fuel_type').val(),
                    weight: $('#car_weight').val(),
                    email: user.email,
                    phone: user.phone
                }
            }).success(function (data) {
                app.f7.dialog.alert(data.message, function (e) {
                    if (data.success == 1) {
                        defaultcar = Cookies.getJSON(cookienames.default_car);
                        if (defaultcar.id == car.id) {
                            Cookies.set(cookienames.default_car, data.car);
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
        }
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});