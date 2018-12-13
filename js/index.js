$(document).on('ready', function (e) {
    console.log('on device ready called');
    FCMPlugin.onTokenRefresh(function(token){
        console.log(token);
        var authenticated = functions.hasCookie(cookienames.authenticated);
        if (authenticated && functions.hasCookie(cookienames.user)) {
            console.log('preparing page');
            registerToken(token);
        }
    });

    FCMPlugin.getToken(function(token){
        console.log(token);
    });

    FCMPlugin.onNotification(function(data){
        if(data.wasTapped){
            //Notification was received on device tray and tapped by the user.
            alert( JSON.stringify(data) );
        }else{
            //Notification was received in foreground. Maybe the user needs to be notified.
            alert( JSON.stringify(data) );
        }
    });

    function registerToken(token) {
        user = Cookies.getJSON(cookienames.user);
        $.ajax({
            url: api.getPath('registertoken'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id,
                token: token
            }
        }).success(function (response) {
            console.log(response);
        }).error(function (error) {
            console.log(error);
        });
    }
});