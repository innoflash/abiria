var functions = {
    hasCookie: function(cookie_name) {
        if (Cookies.get(cookie_name) === undefined) {
            return false;
        } else {
            return true;
        }
    },
    isFieldsValid: function (validate_user_fields, app, type) {
        $string = new Array();
        $error_msg = '';
        var y = 0;
        for ($x = 0; $x < validate_user_fields.length; $x++) {
            if (validate_user_fields[$x].val().length == 0) {
                $string.push(validate_user_fields[$x]);
                $error_msg += validate_user_fields[$x].attr('placeholder') + " can`t be blank<br/>";
            }
        }
        if ($string.length == 0) {
            return true;
        } else {
            if (type === undefined) {
                var notification = app.f7.notification.create({
                    icon: '<i class="f7-icons">chat</i>',
                    subtitle: 'Fields alert !!!',
                    text: $error_msg
                });
                notification.open();
            } else {
                app.f7.dialog.alert($error_msg);
            }
            return false;
        }
    },
    appDefaultSettings: function () {
        Cookies.set(cookienames.toll_options, tollOptions.my_route);
        Cookies.set(cookienames.etoll_options, false);
        Cookies.set(cookienames.rank_radius, 3);
        Cookies.set(cookienames.rank_routes, "walking");
        Cookies.set(cookienames.default_country, coutries.south_africa);
    }
};