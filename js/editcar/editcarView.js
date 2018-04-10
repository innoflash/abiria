define([], function () {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillImage() {
        var car_pics = [
            "img/cars/car1.jpg",
            "img/cars/car1.jpg",
            "img/cars/car2.jpg",
            "img/cars/car3.jpg",
            "img/cars/car4.jpg",
            "img/cars/car5.jpg",
            "img/cars/car6.jpg"
        ];

        $('#car_image').attr('src', car_pics[Math.floor(Math.random() * (car_pics.length + 1))]);
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillImage: fillImage
    };
});

