define(["app", "js/reviews/reviewsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var side = -1;
    var user = {};

    var bindings = [
        {
            element: '#reviewOptions',
            event: 'click',
            handler: reviewOptions
        }, {
            element: '#sendFeedback',
            event: 'click',
            handler: initFeedback
        }, {
            element: '#reportProblem',
            event: "click",
            handler: initReport
        }, {
            element: '#sendReview',
            event: "click",
            handler: sendReview
        }
    ];

    function preparePage() {
        View.fillImage();
        user = Cookies.getJSON(cookienames.user);
        myOptions = app.f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Reviews Options',
                        label: true
                    },
                    {
                        text: 'Send Feedback',
                        bold: true,
                        onClick: function () {
                            initFeedback();
                        }
                    },
                    {
                        text: 'Report a Problem',
                        bold: true,
                        onClick: function () {
                            initReport();
                        }
                    }
                ],
                // Second group
                [
                    {
                        text: 'Cancel',
                        color: 'red'
                    }
                ]
            ]
        });
        reviewPopup = app.f7.popup.create({
            el: '.popup-report',
            animate: true
        });
    }

    function sendReview() {
        var VF = [
            $('#myReview')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Sending review');
            $.ajax({
                url: app_apis.abiri + 'abiri-sendreview',
                method: 'POST',
                timeout: 3000,
                data: {
                    driver_id: user.id,
                    review: $('#myReview').val(),
                    side: side,
                    phone: user.phone,
                    email: user.email
                }
            }).success(function (data) {
                console.log(data);
                app.f7.dialog.alert(data.message, function () {
                    if (data.success) {
                        $("input[type=text], textarea").val("");
                        reviewPopup.close();
                    }
                });
            }).error(function (error) {
                console.log(error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        }
    }

    function reviewOptions() {
        myOptions.open();
    }

    function initFeedback() {
        side = 1;
        View.fillTitle('Feedback');
        reviewPopup.open();
    }

    function initReport() {
        side = 0;
        View.fillTitle('Report');
        reviewPopup.open();
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('reviews outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: function () {

        }
    };
});