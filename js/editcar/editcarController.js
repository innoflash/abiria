define(["app", "js/editcar/editcarView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var cars = {};
    var car = {};
    var id = 0;

    var bindings = [
        {
            element: '#editCar',
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

        $('#vehicle_brand').val(car.brand);
        $('#vehicle_model').val(car.model);
        $('#vehicle_class').val(car.car_class);
        $('#vehicle_reg').val(car.registration_number);
    }

    function editCar() {
        var VF = [
            $('#vehicle_brand'),
            $('#vehicle_model'),
            $('#vehicle_class'),
            $('#vehicle_reg')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Updating your car');
            $.ajax({
                url: app_apis.abiri + 'abiri-editcar',
                method: 'POST',
                timeout: 3000,
                data: {
                    id: car.id,
                    model: $('#vehicle_model').val(),
                    brand: $('#vehicle_brand').val(),
                    reg_num: $('#vehicle_reg').val(),
                    car_class: $('#vehicle_class').val()
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
        onOut: onOut
    };
});