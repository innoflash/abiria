define(["app", "js/addcar/addcarView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [
        {
            element: '#addCar',
            event: 'click',
            handler: addCar
        }
    ];

    function init() {

        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        console.log('add car outting');
    }

    function reinit() {
        console.log('reinitialising');
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        View.fillImage();
        app.f7.picker.create({
            inputEl: '#car_class',
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
            inputEl: '#vehicle_weight',
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
            inputEl: '#fuel_type',
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
    }

    function addCar() {
        $('#addCar').unbind();
        var VF = [
            $('#car_brand'),
            $('#car_model'),
            $('#car_class'),
            $('#reg_num'),
            $('#vehicle_weight'),
            $('#fuel_type')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Adding your car');
            $.ajax({
                url: api.getPath('addcar'),
                method: 'POST',
                timeout: appDigits.timeout,
                data: {
                    driver_id: user.id,
                    model: $('#car_model').val(),
                    brand: $('#car_brand').val(),
                    reg_num: $('#reg_num').val(),
                    car_class: $('#car_class').val(),
                    weight: $('#vehicle_weight').val(),
                    fuel_type: $('#fuel_type').val(),
                    email: user.email,
                    phone: user.phone
                }
            }).success(function (data) {
                app.f7.dialog.alert(data.message, function (e) {
                    if (data.success == 1) {
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