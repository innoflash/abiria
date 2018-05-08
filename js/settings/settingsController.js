define(["app", "js/settings/settingsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [
        {
            element: '#restoreDefaults',
            event: 'click',
            handler: restoreDefaults
        }, {
            element: '#resetSettings',
            event: 'click',
            handler: restoreDefaults
        },
        {
            element: '#reloadTollgates',
            event: 'click',
            handler: reloadTollgates
        },
        {
            element: '#reloadEtolls',
            event: "click",
            handler: reloadEtolls
        },
        {
            element: '#reloadRanks',
            event: "click",
            handler: reloadRanks
        }
    ];


    function reloadRanks() {
        app.f7.dialog.preloader('Reloading taxi ranks');
        $.ajax({
            url: app_apis.abiri + 'abiri-taxiranks',
            timeout: 3000,
            method: 'POST'
        }).success(function (taxiRanks) {
            localStorage.setItem(cookienames.taxi_ranks, JSON.stringify(taxiRanks));
            Cookies.set(cookienames.has_taxi_ranks, true, {
                expires: 21
            });
            app.f7.dialog.alert('Taxi ranks updated!');
        }).error(function (error) {
            console.log(error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function reloadEtolls() {
        app.f7.dialog.preloader('Reloading e-tolls');
        $.ajax({
            url: app_apis.abiri + 'abiri-etolls',
            timeout: 3000,
            method: 'POST'
        }).success(function (etolls) {
            console.log(etolls);
            localStorage.setItem(cookienames.etolls, JSON.stringify(etolls));
            Cookies.set(cookienames.has_etolls, true, {
                expires: 21
            });
            app.f7.dialog.alert('Etolls updated!');
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function restoreDefaults() {
        app.f7.dialog.confirm('Do you really wanna revert your settings back to default settings?', function () {
            functions.appDefaultSettings();
            app.f7.dialog.alert('Your app settings have just been reset', function () {
                app.mainView.router.refreshPage();
            });
        });
    }

    function preparePage() {
        tollgateStaff();
        etollStaff();
        rankStaff();
        rankRoutes();
        countryStaff();
    }

    function countryStaff() {
        var theCountry = Cookies.get(cookienames.default_country);
        $('#defaultCountry').val(theCountry);
        console.log(theCountry);

        app.f7.picker.create({
            inputEl: '#defaultCountry',
            rotateEffect: true,
            on: {
                change: function (picker, values, displayValues) {
                    var currentCountry = values[0];
                    Cookies.set(cookienames.default_country, currentCountry);
                }
            },
            cols: [
                {
                    textAlign: 'center',
                    values: [
                        'South Africa',
                        'Zimbabwe',
                        'Namibia',
                        'Botswana',
                        'Mozambique',
                        'Lesotho',
                        'Swaziland'
                    ]
                }
            ]
        });
    }

    function rankRoutes() {
        var currentValue = Cookies.get(cookienames.rank_routes);
        $('input[value=' + currentValue + '][type=radio]').prop('checked', true);
        $('input[type=radio][name=enroute_rank]').change(function () {
            console.log($(this).val());
            Cookies.set(cookienames.rank_routes, $(this).val());
        });
    }

    function rankStaff() {
        var radius = Cookies.get(cookienames.rank_radius);
        $('#rankRadius').val(radius);
        $('#rankRadius').on('keyup', function () {
            radius = $(this).val();
            if (radius.length != 0) {
                Cookies.set(cookienames.rank_radius, radius);
            } else {
                Cookies.set(cookienames.rank_radius, 3);
            }
        });
    }

    function etollStaff() {
        var etoll = Cookies.get(cookienames.etoll_options);
        console.log(etoll);
        if (etoll == "true" || etoll == true) {
            $('input[name=etolls_options][type=checkbox]').prop('checked', true);
        } else {
            $('input[name=etolls_options][type=checkbox]').prop('checked', false);
        }

        $('input[name=etolls_options][type=checkbox]').on('change', function () {
            var checked = $(this).is(':checked');
            Cookies.set(cookienames.etoll_options, checked);
        });
    }

    function tollgateStaff() {
        var currentValue = Cookies.get(cookienames.toll_options);
        $('input[value=' + currentValue + '][type=radio]').prop('checked', true);
        $('input[type=radio][name=toll_options]').change(function () {
            console.log($(this).val());
            Cookies.set(cookienames.toll_options, $(this).val());
        });
    }

    function reloadTollgates() {
        app.f7.dialog.preloader('Reloading tollgates');
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
            app.f7.dialog.alert('Tollgates updated!');
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error);
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
        /*app.f7.dialog.close();*/
        console.log('settings outting');
        $('.page-previous').show();
    }


    return {
        init: init,
        onOut: onOut,
        reinit: function () {

        }
    };
});