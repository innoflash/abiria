define(["app", "js/editprofile/editprofileView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [
        {
            element: '#editProfile',
            event: 'click',
            handler: editProfile
        }
    ];

    function editProfile() {

    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        View.fillProfile(user);
        View.fillImage(user);

        $('#updateProfile').on('click', function (e) {
            var VF = [
                $('#d_first_name'),
                $('#d_last_name'),
                $('#d_email'),
                $('#d_phone')
            ];

            if (functions.isFieldsValid(VF, app)) {
                app.f7.dialog.preloader('Updating profile');
                $.ajax({
                    url: app_apis.abiri + 'abiri-editprofile',
                    method: 'POST',
                    timeout: 3000,
                    data: {
                        id: user.id,
                        first_name: $('#d_first_name').val(),
                        last_name: $('#d_last_name').val(),
                        email: $('#d_email').val(),
                        phone: $('#d_phone').val()
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message, function () {
                        if (data.success == 1) {
                            Cookies.set(cookienames.user, data.user);
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
        });
    }



    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('edit profile outting');
    }

    function reinit() {
        console.log('reinitialising');
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});