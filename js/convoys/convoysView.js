define([
    'hbs!js/convoys/pendingconvoys',
    'hbs!js/convoys/convoys',
    'hbs!js/convoys/moreconvoys',
], function (pendingConvoysTemplate,
             convoysTemplate,
             moreConvoys) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function fillPending(convoys) {
        $('#pendingConvoys').html(pendingConvoysTemplate(convoys));
    }

    function fillConvoys(convoys) {
        $('#myConvoys').html(convoysTemplate(convoys));
    }
    function fillMoreConvoys(convoys) {
        $('#moreConvoys').append(moreConvoys(convoys));
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    return {
        render: render,
        fillPending: fillPending,
        fillConvoys: fillConvoys,
        fillMoreConvoys: fillMoreConvoys,
    };
});

