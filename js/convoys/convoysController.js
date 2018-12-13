define(["app", "js/convoys/convoysView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var fcmToken = 'test token 34';

    var bindings = [];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        FCMPlugin.getToken(function(token){
            console.log(token);
            fcmToken = token;
        });
        loadPending();
    }

    function loadPending() {
        app.f7.dialog.preloader('Loading pending convoys...');
        $.ajax({
            url: api.getPath('pendingconvoys'),
            method: 'POST',
            timeout: appDigits.timeout,
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id,
                token: fcmToken
            }
        }).success(function (convoys) {
            console.log(convoys);
            if (convoys.data.length != 0) {
                View.fillPending(convoys.data);
                app.f7.dialog.confirm('Would you wanna load even more of your convoys?', function () {
                    loadMoreConvoys(api.getPath('convoys'));
                });
            } else {
                loadMoreConvoys(api.getPath('convoys'));
            }
        }).error(function (error) {
            console.log(error);
            app.f7.dialog.alert(messages.server_error, function () {
                app.mainView.router.back();
            });
        }).always(function () {
            app.f7.dialog.close();
        });
    }

    function loadMoreConvoys(url) {
        console.log('will load more convoys');
        app.f7.dialog.preloader('Loading more convoys');
        $.ajax({
            url: url,
            timeout: appDigits.timeout,
            method: 'POST',
            data: {
                phone: user.phone,
                email: user.email,
                user_id: user.id
            }
        }).success(function (convoys) {
            console.log(convoys);
            if (convoys.meta.pagination.current_page == 1)
                View.fillConvoys(convoys.data);
            else
                View.fillMoreConvoys(convoys.data);

            if (convoys.meta.pagination.current_page == convoys.meta.pagination.total_pages) {
                $('#loadMoreConvoys').hide();
            } else {
                $('#loadMoreConvoys').unbind();
                $('#loadMoreConvoys').on('click', function () {
                    loadMoreConvoys(convoys.meta.pagination.links.next);
                });
            }
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
        console.log('convoys outting');
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