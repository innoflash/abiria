define(["app", "js/journeys/journeysView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [

    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        loadJourneys(app_apis.abiri + 'abiri-myjourneys');
    }

    function loadJourneys(url) {
        app.f7.dialog.preloader('Loading journeys');
        $.ajax({
            url: url,
            method: 'POST',
            timeout: 3000,
            data: {
                driver_id: user.id
            }
        }).success(function (data) {
            console.log(data);
            if (data.data.length == 0) {
                //load blank journey
                View.showBlank();
            }else{
                if (data.meta.pagination.current_page == 1) {
                    View.filljourneys(data);
                }else{
                    View.appendJourneys(data);
                }

                if (data.meta.pagination.total_pages != 1) {
                    $('*#loadMoreJourneys').on('click', function () {
                        $(this).unbind();
                        $(this).hide();
                        var new_url = $(this).attr('next');
                        console.log(new_url);
                        loadJourneys(new_url);
                    });
                }
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
        /*app.f7.dialog.close();*/
        console.log('journeys outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});