define(["app", "js/convoy/convoyView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy_id = app.mainView.router.currentRoute.params.convoy_id;
        console.log(convoy_id);
        loadConvoy();
    }

    function loadConvoy() {
        app.f7.dialog.preloader('Loading convoy details...');
        $.ajax({
            url: api.getPath('convoy'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                convoy_id: convoy_id
            }
        }).success(function (convoy) {
            console.log(convoy);
            View.fillConvoy(convoy.data);
        }).error(function (error) {
            console.log(error);
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
        console.log('convoy outting');
    }

    function reinit() {
        console.log('reinitialising');
        init();
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});