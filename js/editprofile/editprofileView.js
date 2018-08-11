define(['hbs!js/editprofile/profile'], function (profileTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillImage(user) {
        $('*#user_image').attr('src', user.img_url);
    }


    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillProfile(user) {
        $('#editProfileContent').html(profileTemplate(user));
    }

    return {
        render: render,
        fillProfile: fillProfile,
        fillImage: fillImage
    };
});

