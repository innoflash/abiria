define(['hbs!js/convoydrive/members'], function (membersTemplate) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillMembers(members) {
        $('#convoyPals').html(membersTemplate(members));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillMembers: fillMembers
    };
});

