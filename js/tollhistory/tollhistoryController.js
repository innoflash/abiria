define(["app", "js/tollhistory/tollhistoryView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var id = 0;

    var bindings = [

    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        id = app.mainView.router.currentRoute.params.id;
        loadTollHistory(id);
    }

    function loadTollHistory(id) {
        console.log(id);
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
       /* app.f7.dialog.close();*/
        console.log('tollhistory outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});