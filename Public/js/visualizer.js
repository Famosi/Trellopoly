$(document).ready(function() {
  /* Detect ios 11_0_x affected
  * NEED TO BE UPDATED if new versions are affected */
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent),
  iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1/.test(navigator.userAgent);
  /* iOS 11 bug caret position */
  if ( iOS && iOS11 )
  $("body").addClass("iosBugFixCaret");

  var is_log = Trello.authorized();
  loadHome(is_log);
});

function loadHome(is_log) {
    Trello.members.get("me", function(member) {
        var username = member.fullName
        $('#logout').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    });
}

$("#button").click(function() {
  localStorage.setItem("organization", $('#organizationName').val());
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
})


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
  $("#players").html("");
  $("#error").html("");
  $("#playGame").append("<p>Giochiamo " + localStorage.getItem("username") + "!<br>Board ID: " + id +"</p>")
  $(".btns").show()
}

$(".dadi").on("click", function () {
  var result = Math.floor(Math.random() * 12) + 1
  $("#result").html(result)
})
