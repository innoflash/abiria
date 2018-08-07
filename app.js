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
        id: 'zw,co.flashtech.abiri',
        animateNavBackIcon: true,
        panel: {
            swipe: 'left',
        },
        routes: [
            {
                path: '/index',
                url: 'index.html'
            }, {
                path: '/planjourney',
                url: 'pages/destination.html'
            }, {
                path: '/cars',
                url: 'pages/cars.html'
            }, {
                path: '/addcar',
                url: 'pages/addcar.html'
            }, {
                path: "/editcar/:id",
                url: 'pages/editcar.html'
            }, {
                path: '/routes/:place_id',
                url: 'pages/routes.html'
            }, {
                path: '/carview/:id',
                url: 'pages/car.html'
            }, {
                path: '/routedetails/:position',
                url: 'pages/routedetails.html'
            }, {
                path: '/drive/:position',
                url: 'pages/drive.html'
            }, {
                path: '/profile',
                url: 'pages/profile.html'
            }, {
                path: '/editprofile',
                url: 'pages/editprofile.html'
            }, {
                path: '/changepassword',
                url: 'pages/changepassword.html'
            }, {
                path: '/journeys',
                url: 'pages/journeys.html'
            }, {
                path: '/addjourney',
                url: 'pages/destination.html'
            }, {
                path: '/journey/:id',
                url: 'pages/journey.html'
            }, {
                path: '/map',
                url: 'pages/map.html'
            }, {
                path: '/tollhistory/:id',
                url: 'pages/tollhistory.html'
            }, {
                path: '/contact',
                url: 'pages/contact.html'
            }, {
                path: '/reviews',
                url: 'pages/reviews.html'
            }, {
                path: '/about',
                url: 'pages/about.html'
            }, {
                path: '/settings',
                url: 'pages/settings.html'
            }, {
                path: '/taxiranks',
                url: 'pages/taxiranks.html'
            }, {
                path: '/rank/:origin/:destination',
                url: 'pages/rank.html'
            }, {
                path: '/rankDetails/:position',
                url: 'pages/rankDetails.html'
            }, {
                path: '/rankRoute/:rankname/:origin/:destination',
                url: 'pages/rankRoute.html'
            }
        ],
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