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
      /*  try {
            app.f7.dialog.close();
        } catch (e) {
        }*/
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
    }

    function addCar() {
        var VF = [
            $('#car_brand'),
            $('#car_model'),
            $('#car_class'),
            $('#reg_num')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Adding your car');
            $.ajax({
                url: app_apis.abiri + 'abiri-addcar',
                method: 'POST',
                timeout: 3000,
                data: {
                    driver_id: user.id,
                    model: $('#car_model').val(),
                    brand: $('#car_brand').val(),
                    reg_num: $('#reg_num').val(),
                    car_class: $('#car_class').val()
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