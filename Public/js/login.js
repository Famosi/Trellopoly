var onAuthorize = function() {
  Trello.members.get("me", function(member) {
    localStorage.setItem("username", member.fullName)
    localStorage.setItem("token", Trello.token())
    localStorage.setItem("idPlayer", member.id)
    $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    $("#login-userButton").attr("onclick", "logout()");
  });
  localStorage.setItem("is_log", true)
};

var onError = function() {
  alert("no Auth")
}

/*
Trello.authorize({
  interactive: false,
  success: onAuthorize
});
*/

function login() {
  Trello.authorize({
    type: "popup",
    name: "TrelloPoly",
    scope: {
      read: true,
      write: true
    },
    success: onAuthorize,
    error: onError
  });
}

function logout() {
  Trello.deauthorize();
  localStorage.setItem("username", null)
  localStorage.setItem("token", null)
  localStorage.setItem("is_log", false)
  $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> Login")
  $("#login-userButton").attr("onclick", "login()");
  location.reload();
}
