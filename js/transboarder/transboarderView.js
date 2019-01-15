define([
  'hbs!js/transboarder/boarders',
  'hbs!js/transboarder/boarder',
], function (
  boardersTemplate,
  boarderTemplate,
) {
    var $$ = Dom7;
    var $ = jQuery;

    function render(params) {
        bindEvents(params.bindings);
    }

    function bindEvents(bindings) {
        for (var i in bindings) {
            $$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
    }

    function fillBoarders(boarders, callbackFunc) {
      $('#boarderPosts').html(boardersTemplate(boarders))
      if (typeof callbackFunc === 'function') {
        callbackFunc(boarders)
      }
    }

    function fillBoarder(boarder, callbackFunc) {
      $('#boarderDetails').html(boarderTemplate(boarder))
      if (typeof callbackFunc === 'function') {
        callbackFunc(boarder)
      }
    }

    return {
        render: render,
        fillBoarders: fillBoarders,
        fillBoarder: fillBoarder
    };
});
