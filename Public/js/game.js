define(function() {

  var game = {}

  game.movePlayer(n){
    var actualPosition = getPosition()
  }

  //Get player actual position
  function getPosition() {
    $.ajax({
      url: '/api/trello/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
      success: function(res) {
        if (res.success) {

        } else {

        }
      },
      error: function(err) {
        console.log("Error getPosition: " + err);
      }
    });
  }

  return game;
})
