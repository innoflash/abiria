define(["app", "js/index/indexView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

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
        }, {
            element: '#endJourney',
            event: 'click',
            handler: endJourney
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

        showAds();
    }

    function showAds() {
        adInterval = setInterval(function () {
            $.ajax({
                method: 'POST',
                timeout: appDigits.timeout,
                url: api.getPath('getad'),
                data: {
                    phone: user.phone,
                    email: user.email,
                    driver_id: user.id,
                    logs: Cookies.get(cookienames.viewed_logs)
                }
            }).success(function (ad) {
                console.log(ad);
                Cookies.remove(cookienames.viewed_logs);
                $('*#ad_banner').attr('src', ad.data.banner);
                $('*#ad_banner').unbind();
                $('*#ad_banner').on('click', function () {
                    console.log(Cookies.get(cookienames.viewed_logs));
                    var myLogs = Cookies.get(cookienames.viewed_logs);
                    if (myLogs === undefined) {
                        Cookies.set(cookienames.viewed_logs, ad.data.id);
                    } else {
                        Cookies.set(cookienames.viewed_logs, myLogs + ',' + ad.data.id);
                    }
                    window.open(ad.data.link, '_system');
                });
            }).error(function (error) {
                console.log(error);
            });
        }, appDigits.adInterval);
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
        clearInterval(adInterval);
    }

    function facebookAuth() {
        cordova.plugins.firebase.auth.getIdToken().then(function (idToken) {
            // send token to server
            console.log(idToken);
            app.f7.dialog.alert(idToken);
        }).catch(function (error) {
            console.log(error);
            pp.f7.dialog.alert(JSON.stringify(error));
        });
        /*cordova.plugins.firebase.auth.signInWithFacebook().then(function(userInfo) {
            // user is signed in
        });*/
    }

    function gotoJourney() {
        $('#gotoJourney').unbind();
        app.f7.fab.close('.fab-morph');
        console.log('will go to the current journey');
        app.mainView.router.navigate({
            url: '/drive/' + Cookies.get(cookienames.position)
        });
    }

    function endJourney() {
        $('#endJourney').unbind();
        app.f7.fab.close('.fab-morph');
        console.log('ending current journey');
        app.f7.dialog.preloader("Ending journey");
        $.ajax({
            url: api.getPath('updatejourney'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                j_id: Cookies.get(cookienames.journey_id),
                state: 1,
                driver_id: user.id,
                email: user.email,
                phone: user.phone
            }
        }).success(function (data) {
            console.log(data);
            app.f7.dialog.alert(data.message, function () {
                if (data.success) {
                    Cookies.set(cookienames.journey_started, false);
                    Cookies.set(cookienames.journey_id, 0);
                    Cookies.remove(cookienames.journey_id);
                    $('.fab-morph').hide();
                }
            });
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function checkAuthentication() {
        var authenticated = functions.hasCookie(cookienames.authenticated);
        var activateUp = functions.hasCookie(cookienames.activate);
        if (Cookies.get(cookienames.activate) !== undefined || Cookies.get(cookienames.activate) === true) {
            console.log('opening activate');
            activationPopup.open();
        } else {
            if (authenticated && functions.hasCookie(cookienames.user)) {
                console.log('preparing page');
                preparePage();
            } else {
                if (functions.hasCookie(cookienames.activate) && Cookies.get(cookienames.activate)) {
                    console.log('opening activate 2');
                    activationPopup.open();
                }
                loginPopup.open();
                functions.appDefaultSettings();
            }
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
            url: api.getPath('tollgates'),
            timeout: appDigits.timeout,
            method: 'POST',
            data: {
                email: user.email,
                phone: user.phone
            }
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
            url: api.getPath('etolls'),
            timeout: appDigits.timeout,
            method: 'POST',
            data: {
                email: user.email,
                phone: user.phone
            }
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
            url: api.getPath('taxiranks'),
            timeout: appDigits.timeout,
            method: 'POST',
            data: {
                email: user.email,
                phone: user.phone
            }
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
            animate: true,
            on: {
                open: function () {
                    Cookies.set(cookienames.authenticated, false);
                }
            }
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
                    url: api.getPath('activate'),
                    method: 'POST',
                    timeout: appDigits.timeout,
                    data: {
                        driver_id: user.id,
                        email: user.email,
                        phone: user.phone,
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
                    url: api.getPath('deleteprofile'),
                    method: 'POST',
                    timeout: appDigits.timeout,
                    data: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone
                    }
                }).success(function (data) {
                    console.log(data);
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
                    url: api.getPath('reactivate'),
                    method: 'POST',
                    timeout: appDigits.timeout,
                    data: {
                        driver_id: user.id,
                        email: user.email,
                        phone: user.phone
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
        $('#btnForgotPassword').unbind();
        fgtPswdPopup.open();
    }


    function fbAuthentication() {
        $('#btnFbSignin').unbind();
        console.log('doing facebook shit');
        var facebookProvider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithRedirect(facebookProvider).then(function () {
            return firebase.auth().getRedirectResult();
        }).then(function (result) {
            console.log(result);
            var user = {};
            user.first_name = result.additionalUserInfo.profile.first_name;
            user.last_name = result.additionalUserInfo.profile.last_name;
            user.phone = encodeUser(result.user.phoneNumber, result.additionalUserInfo.profile.id);
            user.email = encodeUser(result.additionalUserInfo.profile.email, result.additionalUserInfo.profile.id);
            user.image_url = result.additionalUserInfo.profile.picture.data.url;
            user.social_id = result.additionalUserInfo.profile.id;
            user.auth_type = 'Facebook Login';

            app.f7.dialog.preloader('Signing you in...');
            $.ajax({
                method: 'POST',
                url: api.getPath('sociallogin'),
                timeout: appDigits.timeout,
                data: user
            }).success(function (data) {
                app.f7.dialog.alert(data.message);
                if (data.success) {
                    Cookies.set(cookienames.auth_side, auth_side.google);
                    // Cookies.set(cookienames.authenticated, true);
                    Cookies.set(cookienames.social_activate, true);
                    Cookies.set(cookienames.user, data.user);
                    openSocialActivate(data.user.phone);
                }
            }).error(function (error) {
                console.log(e);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        }).catch(function (reason) {
            app.f7.dialog.alert(reason.message);
        });
    }

    function googleAuth() {
        $('#btnGpSignin').unbind();
        var googleProvider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(googleProvider).then(function () {
            return firebase.auth().getRedirectResult();
        }).then(function (result) {
            console.log(result);
            //app.f7.dialog.alert(JSON.stringify(result));
            var user = {};
            user.first_name = result.additionalUserInfo.profile.given_name;
            user.last_name = result.additionalUserInfo.profile.family_name;
            user.phone = encodeUser(result.user.phoneNumber, result.additionalUserInfo.profile.id);
            user.email = encodeUser(result.additionalUserInfo.profile.email, result.additionalUserInfo.profile.id);
            user.image_url = result.additionalUserInfo.profile.picture;
            user.social_id = result.additionalUserInfo.profile.id;
            user.auth_type = 'Google Login';

            app.f7.dialog.preloader('Signing you in...');
            $.ajax({
                method: 'POST',
                url: api.getPath('sociallogin'),
                timeout: appDigits.timeout,
                data: user
            }).success(function (data) {
                app.f7.dialog.alert(data.message);
                if (data.success) {
                    Cookies.set(cookienames.auth_side, auth_side.google);
                    // Cookies.set(cookienames.authenticated, true);
                    Cookies.set(cookienames.social_activate, true);
                    Cookies.set(cookienames.user, data.user);
                    openSocialActivate(data.user.phone);
                }
            }).error(function (error) {
                console.log(e);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        }).catch(function (reason) {
            app.f7.dialog.alert(reason.message);
        });
    }

    function phoneAuth() {
        $('#btnSignIn').unbind();
        var VF = [
            $('#user_email'),
            $('#user_password')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Signing in...');
            $.ajax({
                method: 'POST',
                url: api.getPath('login'),
                timeout: appDigits.timeout,
                data: {
                    email: $('#user_email').val(),
                    password: $('#user_password').val()
                }
            }).success(function (data) {
                console.log(data);
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
        $('#btnResetPassword').unbind();
        var VF = [
            $('#forgot_email'),
            $('#forgot_phone')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.confirm('Resetting the password makes us change your current one and give you a new one of our own, Proceed?', function () {
                app.f7.dialog.preloader('Resetting password');
                $.ajax({
                    url: api.getPath('forgot-password'),
                    method: 'POST',
                    timeout: appDigits.timeout,
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
        $('#btnSignUp').unbind();
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
                        url: api.getPath('reg'),
                        timeout: appDigits.timeout,
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
                            Cookies.set(cookienames.authenticated, false);
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

    function openSocialActivate(phone) {
        //todo will wire up a social login number
    }

    function logout() {
        $('#btnMoreLogOff').unbind();
        var side = Cookies.get(cookienames.auth_side);
        app.f7.dialog.confirm('Are you sure you want to log out now?', function () {
            Cookies.remove(cookienames.auth_side);
            Cookies.remove(cookienames.user);
            Cookies.remove(cookienames.authenticated);
            if (side == auth_side.abiri_direct) {
                loginPopup.open()
            } else {
                firebase.auth().signOut().then(function () {
                    loginPopup.open();
                }).catch(function (error) {
                    // An error happened.
                });
            }
        });
    }

    function loadHome() {
        $('#linkHome').unbind();
    }

    function inviteOthers() {
        $('#inviteOthers').unbind();
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

    function encodeUser(expectedData, fallbackID) {
        if (expectedData == null) {
            return 'null' + fallbackID;
        } else {
            return expectedData;
        }
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});