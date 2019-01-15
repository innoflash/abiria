require.config({
    paths: {
        handlebars: "lib/handlebars-v4.0.11",
        config: 'js/config',
        hbshelper: "js/hbshelper",
        text: "lib/text",
        hbs: "lib/hbs"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        }
    }
});
define('app', ['js/router'], function (Router) {
    Router.init();
    Router.onOut();
    Router.reinit();

    var f7 = new Framework7({
        root: '#app',
        name: 'ABIRI',
        id: 'net.innoflash.abiri',
        animateNavBackIcon: true,
        panel: {
            swipe: 'left',
        },
        routes: routes,
        theme: 'ios',
        upscroller: {
            text: 'Go down',
            ignorePages: ['index']
        },
        dialog: {
            title: 'ABIRI',
            buttonCancel: 'Nope!'
        },
        statusbar: {
            iosOverlaysWebview: true
        },
        notification: {
            title: 'Abiri',
            closeTimeout: 2500,
        },
        view: {
            pushState: true,
            pushStateAnimate: true,
            pushStateSeparator: '#!'
        }
    });

    var mainView = f7.views.create('.view-main', {
        dynamicNavbar: true
    });

    return {
        f7: f7,
        mainView: mainView,
        router: Router
    };
});
