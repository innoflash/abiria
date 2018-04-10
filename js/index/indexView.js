define(['hbs!js/index/activation'], function (activationTemplate) {
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

        $('*#car_image').attr('src', car_pics[Math.floor(Math.random() * (car_pics.length + 1))]);
    }

    function fillActivation(user) {
        $('#activationStaff').html(activationTemplate(user));
    }

    function fillEmail(user) {
        $('#profile_email').text(user.email);
    }

    function fillName(user) {
        $('#username').text(user.first_name + " " + user.last_name);
    }

    function fillPicture(user) {
        if (user.image_url != null) {
            $('*#user_image').attr('src', user.image_url);
        }
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillImage: fillImage,
        fillEmail: fillEmail,
        fillName: fillName,
        fillPicture: fillPicture,
        fillActivation: fillActivation
    };
});