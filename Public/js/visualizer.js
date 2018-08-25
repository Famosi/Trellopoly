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

  var is_log = localStorage.getItem("is_log");

  if (document.location.pathname == "/") {
    loadHome(is_log)
  } else if (document.location.pathname.startsWith("/organization")) {
    loadOrganization(is_log)
  }
});

function loadHome(is_log) {
  //loadHome
  if (is_log == "true") {
    $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    $("#login-userButton").attr("onclick", "logout()");
  }
  $(".message-container").hide()
}

$('#searchBarContainer > input').on('keypress', function(e){
  if (e.keyCode == 13) {
    loadOrganization(localStorage.getItem("is_log"))
    localStorage.setItem("organization", $(this).val());
    window.history.pushState({},'', "");
  }
  $('html').animate({
        scrollTop: $("#searchBarContainer").offset().top},
        'slow');
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});




function loadOrganization(is_log) {
  window.history.pushState({},'', "organization=" + localStorage.getItem("organization"));
  if (is_log == "true") {
    $(".message-container").show()
    $.ajax({
      url: '/api/trello/organization?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
      success: function(res) {
        if (res.success) {
          $("#error").html("");
          getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
        } else {
          $("#players").html("");
          $("#error").html("<p>" + res.message + "</p>");
        }
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    });
  }
  else {
    $("#error").append("<p>Effettua il login per continuare</p>");
  }
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
  $(".Trello-cards").show()
  $("#dice").show()
}

$("#launchDice").on("click", function () {
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
