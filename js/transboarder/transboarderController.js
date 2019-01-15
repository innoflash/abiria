define(["app", "js/transboarder/transboarderView"], function (app, View) {
  var $ = jQuery;
  var boarder = null;

  var bindings = [

  ];

  function preparePage() {
    user = Cookies.getJSON(cookienames.user);
    initPopups();
    loadBoarders();
  }

  function loadBoarders() {
    app.f7.dialog.preloader('Loading boarder posts..')
    $.ajax({
      url: api.getPath('boarders'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        email: user.email,
        phone: user.phone
      }
    }).success(function(boarders){
      console.log(boarders);
      if (boarders.sucess === false) {
        app.f7.dialog.alert(messages.server_error, function(){
          app.mainView.router.back()
        })
      }else{
        View.fillBoarders(boarders, function(){
          $('*.boarder').on('click', function(){
            var boarder_id = $(this).attr('id');
            console.log(boarder_id)
            loadBoarder(boarder_id)
          });
        })
      }
    }).error(function(err){
      console.log(err);
      app.f7.dialog.alert(messages.server_error, function(){
        app.mainView.router.back()
      })
    }).always(function(){
      app.f7.dialog.close();
    })
  }

  function initPopups() {
    boarderPopup = app.f7.popup.create({
      el: '.popup-boarder',
      animate: true,
      on: {
        open: function(){
          console.log(boarder)
          View.fillBoarder(boarder.data)
        }
      }
    });
  }

  function loadBoarder(id) {
    app.f7.dialog.preloader('Loading boarder')
    $.ajax({
      url: api.getPath('boarder'),
      method: 'POST',
      timeout: appDigits.timeout,
      data: {
        boarder_id: id,
        email: user.email,
        phone: user.phone
      }
    }).success(function(boarderDetails){
      console.log(boarder)
      boarder = boarderDetails
      boarderPopup.open()
    }).error(function(err){
      console.log(err)
      app.f7.dialog.alert(messages.server_error)
    }).always(function(){
      app.f7.dialog.close()
    })
  }

  function init() {
    preparePage()
    View.render({
      bindings: bindings
    });
  }

  function onOut() {
    /*        try {
    app.f7.dialog.close();
  } catch (e) {
}*/
console.log('transboarder outting');
}

function reinit() {
  console.log('reinitialising');
}

return {
  init: init,
  onOut: onOut,
  reinit: reinit
};
});
