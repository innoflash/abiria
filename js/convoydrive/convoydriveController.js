define(["app", "js/convoydrive/convoydriveView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [

    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        convoy = JSON.parse(localStorage.getItem(cookienames.convoyObject));
        console.log(user);
        console.log(convoy);
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
        console.log('convoydrive outting');
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