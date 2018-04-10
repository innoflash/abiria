define(["app", "js/about/aboutView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [

    ];

    function preparePage() {
    }


    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
       /* app.f7.dialog.close();
        console.log(app.f7.dialog);
        try {
            app.f7.dialog.close();
        } catch (e) {
        }*/
        console.log('about outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});