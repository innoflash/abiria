define(function () {
    var $ = Framework7.$;

    /**
     * Init router, that handle page events
     */

    function init() {
        $(document).on('page:init', function (e) {
            var page = e.detail;
            console.log(e);
            if (page.from != "previous") {
                load(page.name, page.route.query);
            }
        })
    }

    function reinit() {
        $(document).on('page:reinit', function (e) {
            console.log(e);
            var page = e.detail;
            reload(page.name, page.route.query);
        })
    }

    function onOut() {
        $(document).on('page:beforeout', function (e) {
            var page = e.detail;
            remove(page.name, page.route.query);
        })
    }

    /**
     * Load (or reload) controller from js code (another controller) - call it's init function
     * @param controllerName
     * @param query
     */
    function load(controllerName, query) {
        require(['js/' + controllerName + '/' + controllerName + 'Controller'], function (controller) {
            controller.init(query);
        });
    }

    function remove(controllerName, query) {
        require(['js/' + controllerName + '/' + controllerName + 'Controller'], function (controller) {
            controller.onOut(query);
        });
    }

    function reload(controllerName, query) {
        require(['js/' + controllerName + '/' + controllerName + 'Controller'], function (controller) {
            controller.reinit(query);
        });
    }

    return {
        init: init,
        load: load,
        onOut: onOut,
        remove: remove,
        reinit: reinit,
        reload: reload
    };
});