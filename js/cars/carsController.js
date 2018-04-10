define(["app", "js/cars/carsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [];

    function init() {
        loadCars();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
    /*    try {
            app.f7.dialog.close();
        } catch (e) {
        }*/
        console.log('add car outting');
    }

    function reinit() {
        console.log('reinitialising');
        app.mainView.router.refreshPage();
    }

    function loadCars() {
        user = Cookies.getJSON(cookienames.user);
        console.log(user);
        app.f7.dialog.preloader('Fetching your cars');
        $.ajax({
            method: 'POST',
            timeout: 3000,
            url: app_apis.abiri + 'abiri-getcars',
            data: {
                id: user.id
            }
        }).success(function (data) {
            console.log(data);
            if (data.success  == 0) {
                app.f7.dialog.alert(data.message);
            }else{
                if (data.cars.total == 0) {
                    View.showBlank();
                }else{
                    localStorage.setItem(cookienames.cars, JSON.stringify(data.cars.data));
                    View.fillCars(data.cars.data);
                }
            }
        }).error(function () {
            View.updateStatus(messages.server_error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});