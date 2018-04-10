define(["app", "js/changepassword/changepasswordView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [
        {
            element: '#changePassword',
            event: 'click',
            handler: changePassword
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        View.fillImage(user);
    }


    function changePassword() {
        var VF = [
            $('#current_password'),
            $('#new_password'),
            $('#cnfm_pswd')
        ];

        if (functions.isFieldsValid(VF, app)) {
            if ($('#new_password').val() === $('#cnfm_pswd').val()) {
                if ($('#new_password').val().length < 6) {
                    app.f7.dialog.alert('Password is too short, enter at least 6 characters for security reasons');
                } else {
                    app.f7.dialog.preloader('Changing password');
                    $.ajax({
                        url: app_apis.abiri + 'abiri-updatepassword',
                        method: 'POST',
                        timeout: 3000,
                        data: {
                            password: $('#current_password').val(),
                            new_password: $('#new_password').val(),
                            id: user.id
                        }
                    }).success(function (data) {
                        app.f7.dialog.alert(data.message, function () {
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
            } else {
                app.f7.dialog.alert('New passwords did not match !!!');
            }
        }
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
/*        try {
            app.f7.dialog.close();
        } catch (e) {
        }*/
        console.log('change password outting');
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