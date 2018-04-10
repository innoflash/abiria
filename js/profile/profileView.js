define(['hbs!js/profile/profile'], function (profileTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillImage(user) {
        if (user.image_url != null) {
            $('*#user_image').attr('src', user.img_url);
        }
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillProfile(user) {
        $('#profileContent').html(profileTemplate(user));
    }

    return {
        render: render,
        fillProfile: fillProfile,
        fillImage: fillImage
    };
});

