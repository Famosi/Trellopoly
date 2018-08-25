var oldPositionIndex = 1;

$(document).ready(function() {
  /* Detect ios 11_0_x affected
  * NEED TO BE UPDATED if new versions are affected */
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent),
  iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1/.test(navigator.userAgent);
  /* iOS 11 bug caret position */
  if ( iOS && iOS11 )
  $("body").addClass("iosBugFixCaret");
  $('.parallax').parallax();

  if (document.location.pathname == "/") {
    loadHome()
  } else if (document.location.pathname.startsWith("/organization")) {
    loadOrganization()
  }
});

function loadHome() {
  //loadHome
}


$('#searchBarContainer > input').on('keypress', function(e){
  if (e.keyCode == 13) {
    loadOrganization()
    localStorage.setItem("organization", $(this).val());
    window.history.pushState({},'', "organization=" + $(this).val());
  }
  $('html').animate({
        scrollTop: $("#searchBarContainer").offset().top},
        'slow');
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});




function loadOrganization() {
  $.ajax({
    url: '/api/trello/organization?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        $("#error").html("");
        $("#playGame").html("");
        getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
      } else {
        $("#players").html("");
        $("#playGame").html("");
        $("#error").append("<p>" + res.message + "</p>");
      }
    },
    error: function(err) {
      console.log("Error: " + err);
    }
  });
}

function getBoards(organization, token) {
  $.ajax({
    url: '/api/trello/boards?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        var index = 1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].name != "Scatola") {

            $("#players").append("<div class=\"card col-xs-12 col-sm-8 col-md-6 col-lg-3\" style=\"width: 18rem;\"> <img class=\"card-img-top\" src=\"...\" alt=\"Card image cap\"> <div class=\"card-body\"> <h5 class=\"card-title\">" + res.data[i].name + "</h5> <p class=\"card-text\">Some quick example text to build on the card title and make up the bulk of the card's content.</p><a href=\"javascript:void(0)\" class=\"btn btn-primary\" onClick=loadPlayer(\"" + res.data[i].id + "\")>Play!</a></div></div>")
            //$("#players").append("<button onClick=loadPlayer(\"" + res.data[i].id + "\")>" + res.data[i].id + "</button>")
            index++
          } else {
            localStorage.setItem("idScatola", res.data[i].id);
          }
        }
      }
    },
    error: function(err) {
      console.log("Error getBoards: " + err);
    }
  });
}

function loadPlayer(id) {
  localStorage.setItem("playerBoardId", id);
  $("#players").html("");
  $("#error").html("");
  $("#playGame").append("<p>Giochiamo " + localStorage.getItem("username") + "!<br>Board ID: " + localStorage.getItem("playerBoardId") +"</p>")
  $(".Trello-cards").show()
  $("#dice").show()
}

$("#dice").on("click", function () {
  var result = Math.floor(Math.random() * 12) + 1;
  localStorage.setItem("dadi", result);
  $("#result").html(result);
  movePlayer(result);
})

function movePlayer(n) {
  $.ajax({
    url: '/api/trello/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        var oldPosition = res.cardId
        var oldPositionName = res.position
        console.log("Actual position: " + oldPositionName);
        console.log("oldIndex: " + oldPositionIndex);
        oldPositionIndex += n
        if (oldPositionIndex > 40) {
          oldPositionIndex = oldPositionIndex - 40
        }
        console.log("newIndex: " + oldPositionIndex);
        console.log(oldPositionIndex);
        $.ajax({
          url: '/api/trello/move?newPosition=' + oldPositionIndex + '&id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
          success: function (res) {
            console.log(res.newPosition);
            archiveOldPosition(oldPosition, oldPositionName);
          },
          error: function (err) {
            console.log("Error getPositionIn: " + err);
          }
        });
      } else {

      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

function archiveOldPosition(cardId, cardName) {
  $.ajax({
    url: '/api/trello/archive?cardId=' + cardId + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        console.log("Archive " + cardName);
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}
