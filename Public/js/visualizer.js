
$(document).ready(function() {
  /* Detect ios 11_0_x affected
  * NEED TO BE UPDATED if new versions are affected */
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent),
  iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1/.test(navigator.userAgent);
  /* iOS 11 bug caret position */
  if ( iOS && iOS11 )
  $("body").addClass("iosBugFixCaret");

  var is_log = Trello.authorized();
  if (document.location.pathname == "/") {
    loadHome()
  } else if (document.location.pathname.startsWith("/organization")) {
    loadOrganization()
  }
});

function loadHome() {

}

$("#button").click(function() {
  loadOrganization()
  localStorage.setItem("organization", $('#organizationName').val());
  window.history.pushState({},'', "organization="+localStorage.getItem("organization"));
})

function loadOrganization() {
  $.ajax({
    url: '/api/trello/organization?organization='+localStorage.getItem("organization")+"&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        $("#error").html("");
        $("#playGame").html("");
        getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
      } else {
        console.log(res.message);
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
        console.log(res.data[0].name);
        var index = 1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].name != "Scatola") {
            $("#players").append("<button class=\"player" + index + "\" onClick=loadPlayer(\"" + res.data[i].id + "\")>" + res.data[i].name + "</button>");
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
  console.log(id);
  localStorage.setItem("playerBoardId", id);
  $("#players").html("");
  $("#error").html("");
  $("#playGame").append("<p>Giochiamo " + localStorage.getItem("username") + "!<br>Board ID: " + localStorage.getItem("playerBoardId") +"</p>")
  $(".btns").show()
}

$(".dadi").on("click", function () {
  var result = Math.floor(Math.random() * 12) + 1;
  localStorage.setItem("dadi", result);
  $("#result").html(result);
  movePlayer(result);
})

function movePlayer(n){
  getPosition(n)

}

function getPosition(n) {
  $.ajax({
    url: '/api/trello/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        console.log(res.position);
        var newPosition = 1 + n
        $.ajax({
          url: '/api/trello/move?newPosition=' + newPosition + '&token=' + localStorage.getItem("token"),
          success: function (res) {
            console.log(rsp.message);
          },
          error: function (res) {
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
