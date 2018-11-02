define(["app", "js/convoys/convoysView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [];

    function preparePage() {
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
    }

    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});