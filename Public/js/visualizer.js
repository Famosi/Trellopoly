var oldPositionIndex = 1;

var host = location.origin.replace(/^http/, 'ws');
host = host.replace(/8000/, '40510')

var ws = new WebSocket(host);

// event emmited when connected
ws.onopen = function() {
  console.log('websocket is connected...')
}
// event emmited when receiving message
ws.onmessage = function(msg) {
  $("#error").html(msg.data);
  if (msg.data == "Inizializzo la partita...") {
    moveBar()
    getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
  }
}

$(document).ready(function() {
  /* Detect ios 11_0_x affected
   * NEED TO BE UPDATED if new versions are affected */
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent),
    iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1/.test(navigator.userAgent);
  /* iOS 11 bug caret position */
  if (iOS && iOS11)

  $("body").addClass("iosBugFixCaret");

  $('.parallax').parallax();
  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false
  });

  var is_log = localStorage.getItem("is_log");

  if (is_log == "true") {
    $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    $("#login-userButton").attr("onclick", "logout()");
  }

  if (document.location.pathname == "/") {
    loadHome(is_log)
  } else if (document.location.pathname.startsWith("/organization")) {
    localStorage.setItem("organization", document.location.pathname.split("=")[1].split("/")[0])
    loadOrganization(is_log)
  }
});

function loadHome(is_log) {
  //loadHome
  $("#searchBarContainer").show();
  $(".message-container").hide()
  $(".input-field").hide()
  $(".fixed-action-btn").hide()
}

$(".navbar-brand").on("click", function () {
  window.history.pushState({}, '', "/");
  location.reload()
});

$('#searchBarContainer > input').on('keypress', function(e) {
  if (e.keyCode == 13) {
    localStorage.setItem("organization", $(this).val());
    window.history.pushState({}, '', "/");
    window.history.pushState({}, '', "organization=" + localStorage.getItem("organization"));
    loadOrganization(localStorage.getItem("is_log"))
  }
});

$("#numberOP").on("change", function(select) {
  var nop = select.currentTarget.value
  $(".input-field").hide()
  $("#searchBarContainer").hide()
  $.ajax({
    url: '/api/init/nop?nop=' + 1 + "&organization=" + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        if (res.isStart) {
          moveBar()
          getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
        } else {
          initGame(localStorage.getItem("organization"), localStorage.getItem("token"))
        }
      } else {
        $("#players").html("");
        $("#error").html("<p>" + res.message + "</p>");
      }
    },
    error: function(err) {
      console.log("Error: " + err);
    }
  });
})

function loadOrganization(is_log) {
  $("#error").html("");
  $(".fixed-action-btn").hide()
  if (is_log == "true") {
    $("#searchBarContainer").hide()
    $('html').animate({
        scrollTop: $("#searchBarContainer").offset().top
      },
      'slow');
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    $(".message-container").show()

    $.ajax({
      url: '/api/init/organization?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
      success: function(res) {
        if (res.success) {
          $("#error").html("");
          $(".input-field").show();
          for (var i = 1; i < res.boardLen; i++) {
            $("#numberOP").append("<option value=\"" + (i+1) +"\">" + (i+1) + "</option>");
          }
          if (res.isSetNop) {
            eventFire(document.getElementById('numberOP'), 'change');
          }
          //initGame(localStorage.getItem("organization"), localStorage.getItem("token"))
          //getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
        } else {
          $("#searchBarContainer").show()
          $(".input-field").hide();
          $("#players").html("");
          $("#error").html("<p>" + res.message + "</p>");
        }
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    });
  } else {
    $(".input-field").hide()
    //$("#error").html("<p>Effettua il login per continuare</p>");
    alert("Effettua il login per continuare")
  }
}

function getBoards(organization, token) {
  $("#searchBarContainer").hide()
  $(".input-field").hide()
  $("#error").html("")
  $(".players-container").html("")
  $.ajax({
    url: '/api/game/boards?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        $("#progressmsg").hide()
        $(".players > .message").text("Scegli la pedina:")
        var index = 1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].name != "Scatola") {
            var imgsrc
            if (res.data[i].prefs.backgroundImage != null) {
              imgsrc = res.data[i].prefs.backgroundImage
            } else {
              imgsrc = "https://i.pinimg.com/originals/3b/4b/b9/3b4bb9846a1f2f5adc87b849e9f3dbea.jpg"
            }
            $(".players-container").append("<div class=\"card col-xs-12 col-sm-8 col-md-6 col-lg-3\" style=\"width: 18rem;\"> <img class=\"card-img-top-board\" src=\"" + imgsrc + "\" alt=\"Card image cap\"> <div class=\"card-body\"><div class=\"anchor-container\" style=\"text-align: center;\"><a href=\"javascript:void(0)\" class=\"waves-effect waves-light btn\" onClick=loadPlayer(\'" + res.data[i].id + '\',\'' + res.data[i].name + "\')>" + res.data[i].name + "</a></div></div></div>")
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
    url: '/api/init/initialize?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
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


function loadPlayer(id, name) {
  localStorage.setItem("playerBoardId", id);
  $("#error").html("");
  $(".players-container").hide()
  $(".players > .message").text("")
  $("#namePlayer").text(name)
  $.ajax({
    url: '/api/init/start?organization=' + localStorage.getItem("organization"),
    success: function(res) {
      if (res.success) {
        if (!res.isStart) {
          giveContratti(id, function() {
            $("#progressmsg").hide()
            $(".Trello-cards").show()
            $(".fixed-action-btn").show()
          })
        } else {
          $("#progressmsg").hide()
          $(".Trello-cards").show()
          $(".fixed-action-btn").show()
        }
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

function giveContratti(id, callback) {
  moveBar()
  $("#progressmsg").text("Distribuendo i contratti..")
  $("#progressmsg").show()
  $.ajax({
    url: '/api/init/contratti?boardId=' + id + '&token=' + localStorage.getItem("token") + "&organization=" + localStorage.getItem("organization"),
    success: function(res) {
      if (res.success) {
        callback();
      } else {
        $("#error").html("<p>" + res.message + "</p>")
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

$("#launchDice").on("click", function(e) {
  e.preventDefault();
  var min = Math.ceil(2);
  var max = Math.floor(12);
  var result = Math.floor(Math.random() * (max - min + 1)) + min
  localStorage.setItem("dadi", result);
  $("#resultDice").text(result);
  movePlayer(result);
})

$(".fixed-action-btn").on("click", function (e) {
  e.preventDefault()
  $.ajax({
    url: '/api/init/gameover?organization=' + localStorage.getItem("organization"),
    success: function(res) {
      window.history.pushState({}, '', "/");
      location.reload()
    },
    error: function(err) {
      console.log("Error Gameover: " + err);
    }
  });
})

function movePlayer(n) {
  $.ajax({
    url: '/api/game/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        var oldPosition = res.cardId
        var oldPositionName = res.position
        oldPositionIndex += n
        if (oldPositionIndex > 40) {
          oldPositionIndex = oldPositionIndex - 40
        }
        $.ajax({
          url: '/api/game/move?newPosition=' + oldPositionIndex + '&organization=' + localStorage.getItem("organization") + '&token=' + localStorage.getItem("token"),
          success: function(res) {
            archiveOldPosition(oldPosition, oldPositionName);
          },
          error: function(err) {
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

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
