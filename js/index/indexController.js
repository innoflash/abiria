define(["app", "js/index/indexView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [
        {
            element: '#btnFbSignin',
            event: 'click',
            handler: fbAuthentication
        }, {
            element: '#btnGpSignin',
            event: 'click',
            handler: googleAuth
        }, {
            element: '#btnSignIn',
            event: 'click',
            handler: phoneAuth
        }, {
            element: '#btnForgotPassword',
            event: 'click',
            handler: openForgotPassword
        }, {
            element: '#btnCancelForgotPassword',
            event: 'click',
            handler: closeForgotPassword
        }, {
            element: '#btnResetPassword',
            event: 'click',
            handler: resetPassword
        }, {
            element: '#btnSignUp',
            event: 'click',
            handler: createAccount
        }, {
            element: '#btnMoreLogOff',
            event: 'click',
            handler: logout
        }, {
            element: '#linkHome',
            event: 'click',
            handler: loadHome
        }, {
            element: '#inviteOthers',
            event: 'click',
            handler: inviteOthers
        }, {
            element: '#gotoJourney',
            event: 'click',
            handler: gotoJourney
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        console.log(user);
        View.fillEmail(user);
        View.fillName(user);
        View.fillPicture(user);

        if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
            $('.fab-morph').show();
        } else {
            $('.fab-morph').hide();
        }

        console.log(functions.hasCookie(cookienames.has_tollgates));
        //save tollgates in the cache
        if (!functions.hasCookie(cookienames.has_tollgates)) {
            getTollgates();
        }
    }

    function init() {
        app.f7.panel.close();
        initPopups();
        checkAuthentication();
        console.log(app);
        View.fillImage();
        View.render({
            bindings: bindings
        });
    }

    function reinit() {
        console.log('reinitialising');
        app.mainView.router.refreshPage();
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('index outting');
    }

    function gotoJourney() {
        app.f7.fab.close('.fab-morph');
        console.log('will go to the current journey');
        app.mainView.router.navigate({
            url: '/drive/' + Cookies.get(cookienames.position)
        });
    }

    function checkAuthentication() {
        var authenticated = functions.hasCookie(cookienames.authenticated);
        if (authenticated && functions.hasCookie(cookienames.user)) {
            preparePage();
        } else {
            if (functions.hasCookie(cookienames.activate) && Cookies.get(cookienames.activate)) {
                activationPopup.open();
            }
            loginPopup.open();
            functions.appDefaultSettings();
        }

    }

    function getTollgates() {
        var notification = app.f7.notification.create({
            icon: '<i class="f7-icons">chat</i>',
            subtitle: 'App progress !!!',
            //   text: 'Loading tollgates, etolls and taxi-ranks into cache',
            text: 'Loading tollgates and taxi-ranks into cache',
            closeOnClick: true,
            titleRightText: 'now'
        });
        notification.open();
        $.ajax({
            url: app_apis.abiri + 'abiri-tollgates',
            timeout: 3000,
            method: 'POST'
        }).success(function (tollgates) {
            console.log(tollgates);
            localStorage.setItem(cookienames.tollgates, JSON.stringify(tollgates));
            Cookies.set(cookienames.has_tollgates, true, {
                expires: 21
            });
            getEtolls();
        }).error(function (error) {
            console.log(error);
        });
    }

    function getEtolls() {
        $.ajax({
            url: app_apis.abiri + 'abiri-etolls',
            timeout: 3000,
            method: 'POST'
        }).success(function (etolls) {
            localStorage.setItem(cookienames.etolls, JSON.stringify(etolls));
            Cookies.set(cookienames.has_etolls, true, {
                expires: 21
            });
            getTaxiRanks();
        }).error(function () {
            console.log(error);
        });
    }

    function getTaxiRanks() {
        $.ajax({
            url: app_apis.abiri + 'abiri-taxiranks',
            timeout: 3000,
            method: 'POST'
        }).success(function (taxiRanks) {
            localStorage.setItem(cookienames.taxi_ranks, JSON.stringify(taxiRanks));
            Cookies.set(cookienames.has_taxi_ranks, true, {
                expires: 21
            });
        }).error(function () {
            console.log(error);
        });
    }

    function initPopups() {
        loginPopup = app.f7.popup.create({
            el: '.popup-login',
            animate: true
        });
        registerPopup = app.f7.popup.create({
            el: '.popup-signup',
            animate: true
        });
        fgtPswdPopup = app.f7.popup.create({
            el: '.popup-forgot-password',
            animate: true
        });
        activationPopup = app.f7.popup.create({
            el: '.popup-activation',
            animate: true,
            on: {
                open: function () {
                    preloadForActivation();
                }
            }
        });
    }

    function preloadForActivation() {
        user = Cookies.getJSON(cookienames.user);
        View.fillActivation(user);
        $('#btnActivate').on('click', function () {
            var VF = [
                $('#activation_code')
            ];

            if (functions.isFieldsValid(VF, app)) {
                app.f7.dialog.preloader('Activating account');
                $.ajax({
                    url: app_apis.abiri + 'abiri-activate',
                    method: 'POST',
                    timeout: 3000,
                    data: {
                        driver_id: user.id,
                        code: $('#activation_code').val()
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message);
                    if (data.success) {
                        $("input[type=text], textarea").val("");
                        Cookies.set(cookienames.authenticated, true);
                        Cookies.set(cookienames.auth_side, auth_side.abiri_direct);
                        loginPopup.close();
                        activationPopup.close();
                        registerPopup.close();
                        Cookies.set(cookienames.activate, false);
                        Cookies.remove(cookienames.activate);
                        preparePage();
                    }
                }).error(function (error) {
                    console.log(error);
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            }

        });

        $('#cancelAccount').on('click', function () {
            app.f7.dialog.confirm('Are you sure you want to cancel your pending account?', function () {
                app.f7.dialog.preloader('Please wait');
                $.ajax({
                    url: app_apis.abiri + 'abiri-deleteprofile',
                    method: 'POST',
                    timeout: 3000,
                    data: {
                        id: user.id
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message, function () {
                        if (data.success == 1) {
                            activationPopup.close();
                            $("input[type=text], textarea").val("");
                        }
                    });
                }).error(function () {
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        });

        $('#resendCode').on('click', function () {
            app.f7.dialog.confirm('You didn`t receive the activation code and you want us resend to you?', function () {
                console.log('sending reactivation code');
                app.f7.dialog.preloader('Resending code');
                $.ajax({
                    url: app_apis.abiri + 'abiri-reactivate',
                    method: 'POST',
                    timeout: 3000,
                    data: {
                        driver_id: user.id
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message);
                    $("input[type=text], textarea").val("");
                }).error(function (error) {
                    console.log(error);
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        });
    }

    function closeForgotPassword() {
        fgtPswdPopup.close();
    }

    function openForgotPassword() {
        fgtPswdPopup.open();
    }


    function fbAuthentication() {
        facebookConnectPlugin.login(["public_profile", "email"], function (result) {
            //calling api after login success
            facebookConnectPlugin.api("/me?fields=email,name,picture",
                ["public_profile", "email"]
                , function (userData) {
                    //API success callback
                    app.f7.dialog.alert(JSON.stringify(userData));
                }, function (error) {
                    //API error callback
                    app.f7.dialog.alert(JSON.stringify(error));
                });
        }, function (error) {
            //authenication error callback
            app.f7.dialog.alert(JSON.stringify(error));
        });
    }

    function googleAuth() {
        window.plugins.googleplus.login(
            {},
            function (obj) {
                app.f7.dialog.alert(JSON.stringify(obj)); // do something useful instead of alerting
            },
            function (msg) {
                app.f7.dialog.alert('error: ' + msg);
            }
        );
    }

    function phoneAuth() {
        var VF = [
            $('#user_email'),
            $('#user_password')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Signing in...');
            $.ajax({
                method: 'POST',
                url: app_apis.abiri + 'abiri-login',
                timeout: 3000,
                data: {
                    email: $('#user_email').val(),
                    password: $('#user_password').val()
                }
            }).success(function (data) {
                $("input[type=text], textarea").val("");
                app.f7.dialog.alert(data.message);
                if (data.success) {
                    Cookies.set(cookienames.user, data.user);
                    if (data.activate) {
                        //     Cookies.set(cookienames.activate, true);
                        activationPopup.open();
                    } else {
                        loginPopup.close({
                            animate: true
                        });
                        Cookies.set(cookienames.auth_side, auth_side.abiri_direct);
                        Cookies.set(cookienames.authenticated, true);
                        preparePage();
                    }
                }

            }).error(function (error) {
                console.log(error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        }
    }

    function openActivation() {
        activationPopup.open();
    }

    function resetPassword() {
        var VF = [
            $('#forgot_email'),
            $('#forgot_phone')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.confirm('Resetting the password makes us change your current one and give you a new one of our own, Proceed?', function () {
                app.f7.dialog.preloader('Resetting password');
                $.ajax({
                    url: app_apis.abiri + 'abiri-forgot-password',
                    method: 'POST',
                    timeout: 3000,
                    data: {
                        email: $('#forgot_email').val(),
                        phone: $('#forgot_phone').val()
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message, function () {
                        if (data.success) {
                            $("input[type=text], textarea").val("");
                            fgtPswdPopup.close();
                        }
                    });
                }).error(function (error) {
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        }
    }

    function createAccount() {
        var VF = [
            $('#first_name'),
            $('#last_name'),
            $('#email'),
            $('#phone'),
            $('#password'),
            $('#confirm_password')
        ];

        if (functions.isFieldsValid(VF, app)) {
            if ($('#password').val() === $('#confirm_password').val()) {
                if ($('#password').val().length < 6) {
                    app.f7.dialog.alert('Password is too short, enter at least 6 characters for security reasons');
                } else {
                    app.f7.dialog.preloader('Signing up...');
                    $.ajax({
                        method: 'POST',
                        url: app_apis.abiri + 'abiri-reg',
                        timeout: 3000,
                        data: {
                            first_name: $('#first_name').val(),
                            last_name: $('#last_name').val(),
                            email: $('#email').val(),
                            phone: $('#phone').val(),
                            password: $('#password').val()
                        }
                    }).success(function (data) {
                        $("input[type=text], textarea").val("");
                        console.log(data);
                        app.f7.dialog.alert(data.message);
                        if (data.success) {
                            /*     loginPopup.close({
                                     animate: true
                                 });*/
                            registerPopup.close({
                                animate: true
                            });
                            Cookies.set(cookienames.auth_side, auth_side.abiri_direct);
                            // Cookies.set(cookienames.authenticated, true);
                            Cookies.set(cookienames.activate, true);
                            Cookies.set(cookienames.user, data.user);
                            openActivation();
                        } else {
                            if (data.user == null) {
                                app.f7.dialog.alert('Cant create account using these details, either email or phone is already in use');
                            } else {
                                Cookies.set(cookienames.auth_side, auth_side.abiri_direct);
                                Cookies.set(cookienames.user, data.user);
                                Cookies.set(cookienames.activate, true);
                                openActivation();
                            }
                        }
                    }).error(function (e) {
                        console.log(e);
                        app.f7.dialog.alert(messages.server_error);
                    }).always(function () {
                        app.f7.dialog.close();
                    });
                }
            } else {
                app.f7.dialog.alert('Passwords did not match !!!');
            }
        }
    }

    function logout() {
        var side = Cookies.get(cookienames.auth_side);
        app.f7.dialog.confirm('Are you sure you want to log out now?', function () {
            Cookies.remove(cookienames.auth_side);
            Cookies.remove(cookienames.user);
            Cookies.remove(cookienames.authenticated);
            if (side == auth_side.abiri_direct) {
                loginPopup.open()
            } else if (side == auth_side.google) {
                window.plugins.googleplus.logout(
                    function (msg) {
                        app.f7.dialog.alert(msg, function () {
                            loginPopup.open();
                        });
                    }
                );
            } else {
                //log facebook out
            }
        });
    }

    function loadHome() {

    }

    function inviteOthers() {
        var options = {
            message: "Hi, I am Abiri: the real innovation in motion. Try my new services and experience the fun of smart travelling. \n\nGet me from ", // not supported on some apps (Facebook, Instagram)
            subject: 'Abiri', // fi. for email
            url: 'https://www.abiri.net',
            chooserTitle: 'Share with' // Android only, you can override the default share sheet title
        };

        var onSuccess = function (result) {
            /*   console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
               console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)

               app.f7.alert("Shared to app: " + result.app);
               app.f7.alert("Share completed? " + result.completed);*/
        };

        var onError = function (msg) {
            console.log("Sharing failed with message: " + msg);
            app.f7.alert("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});