define(["app", "js/testmap/testmapView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [

    ];

    function preparePage() {
        var map = new GoogleMap();
        map.initialize();
    }


    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function reinit() {
        console.log('reinitialising testmap');
    }

    function onOut() {
        /* app.f7.dialog.close();
         console.log(app.f7.dialog);
         try {
             app.f7.dialog.close();
         } catch (e) {
         }*/
        console.log('testmap outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});