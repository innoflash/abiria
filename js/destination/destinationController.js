define(["app", "js/destination/destinationView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [
        {
            element: '#back',
            event: 'click',
            handler: restorePages
        }
    ];

    function preparePage() {
        if (Cookies.get(cookienames.journey_started) == true || Cookies.get(cookienames.journey_started) == "true") {
            app.f7.dialog.confirm('You have a pending journey that you haven`t finished/cancelled, please deal with this one first before you make another', function () {
                //goto the journey
                app.mainView.router.navigate({
                    url: '/drive/' + Cookies.get(cookienames.position)
                });
            }, function () {
                app.mainView.router.back();
            });
        } else {
            var searchbar = app.f7.searchbar.create({
                el: '.searchbar'
            });
            bindings.push({
                element: '#destinationSearch',
                event: 'keyup',
                handler: _.debounce(searchResults, 600)
            });
            if (!functions.hasCookie(cookienames.default_car)) {
                app.f7.dialog.confirm('Before you choose destinations you need to set a default car for tollgates` sake, Would you wanna choose a default car now?', function () {
                    app.mainView.router.navigate({
                        url: '/cars'
                    });
                });
            }

        }
    }

    function init() {
        preparePage();
        console.log(app);
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*        if (app.f7.dialog.get() != undefined) {
                    app.f7.dialog.close();
                }else{
                    console.log('is null');
                }*/
    }

    function reinit() {
        console.log('reinitialising');
        app.mainView.router.refreshPage();
    }

    function restorePages() {
        $('#indexPage').show();
        $('#locationPage').show();
        console.log('back pressed');
    }

    function searchResults() {
        if ($$("#destinationSearch").val().length >= 5) {
            View.updateStatus('Searching destination ....');
            $.ajax({
                url: google.findPlaces($('#destinationSearch').val()),
                method: 'GET',
                timeout: 3000
            }).success(function (data) {
                if (data.status == 'OK') {
                    View.fillPlaces(data);
                } else {
                    View.updateStatus(data.status)
                }
                console.log(data);
            }).error(function (error) {
                console.log(error);
                View.updateStatus(messages.server_error);
            }).always(function () {

            });
        }
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});