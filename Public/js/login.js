
var onAuthorize = function() {
  Trello.members.get("me", function(member) {
      localStorage.setItem("username", member.fullName)
  });
  $('#logout').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
  loadHome()
};

var onError = function() {
  alert("no Auth")
}

var logout = function() {
    Trello.deauthorize();
};

Trello.authorize({
    interactive: false,
    success: onAuthorize
});


$("#login").click(function() {
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
});

$("#logout").click(logout);
