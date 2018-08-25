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

  if (is_log == "true") {
    $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    $("#login-userButton").attr("onclick", "logout()");
  }

  if (document.location.pathname == "/") {
    loadHome(is_log)
  } else if (document.location.pathname.startsWith("/organization")) {
    loadOrganization(is_log)
  }
});

function loadHome(is_log) {
  //loadHome
  $("#searchBarContainer").show();
  $(".message-container").hide()
}

$('#searchBarContainer > input').on('keypress', function(e){
  if (e.keyCode == 13) {
    localStorage.setItem("organization", $(this).val());
    window.history.replaceState({},'', "organization=" + localStorage.getItem("organization"));
    loadOrganization(localStorage.getItem("is_log"))
  }
});


function loadOrganization(is_log) {
  if (is_log == "true") {
    $('html').animate({
          scrollTop: $("#searchBarContainer").offset().top},
          'slow');
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    $(".message-container").show()
    $.ajax({
      url: '/api/game/organization?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
      success: function(res) {
        if (res.success) {
          $("#error").html("");
          initGame(localStorage.getItem("organization"), localStorage.getItem("token"))
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
  $("#searchBarContainer").hide()
  $.ajax({
    url: '/api/game/boards?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        $(".players > .message").text("Scegli la pedina:")
        var index = 1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].name != "Scatola") {
            var imgsrc
            if (res.data[i].name == "Fiasco") {
              imgsrc = "https://c1.staticflickr.com/8/7293/8830540164_63f3fd8bb3_b.jpg"
            } else if (res.data[i].name == "Paolo") {
              imgsrc = "http://www.ferreromaurizio.it/blog/wp-content/uploads/2016/12/monopoli.jpg"
            }
            $(".players-container").append("<div class=\"card col-xs-12 col-sm-8 col-md-6 col-lg-3\" style=\"width: 18rem;\"> <img class=\"card-img-top\" src=\"" + imgsrc + "\" alt=\"Card image cap\"> <div class=\"card-body\"><div class=\"anchor-container\" style=\"text-align: center;\"><a href=\"javascript:void(0)\" class=\"btn btn-primary\" onClick=loadPlayer(\"" + res.data[i].id + "\")>" + res.data[i].name + "</a></div></div></div>")
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

function initGame(organization, token) {
  $("#progressmsg").text("Inizializzo la partita...")
  moveBar()
  setStartPosition(organization, token)
}

function setStartPosition(organization, token) {
  console.log("setStartPosition");
  $.ajax({
    url: '/api/init/initialize?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {

      }
    },
    error: function(err) {
      console.log("Error getBoards: " + err);
    }
  });
}

function moveBar() {
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 5);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}


function loadPlayer(id) {
  localStorage.setItem("playerBoardId", id);
  $(".players").html("");
  $("#error").html("");
  $(".Trello-cards").show()
}

$("#launchDice").on("click", function (e) {
  e.preventDefault();
  var result = Math.floor(Math.random() * 12) + 1;
  localStorage.setItem("dadi", result);
  $("#result").html(result);
  movePlayer(result);
})

function movePlayer(n) {
  $.ajax({
    url: '/api/game/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
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
          url: '/api/game/move?newPosition=' + oldPositionIndex + '&id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
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
    url: '/api/game/archive?cardId=' + cardId + '&token=' + localStorage.getItem("token"),
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
