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

    function reinit() {
        console.log('reinitialising');
    }

    function onOut() {
        console.log('about outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});