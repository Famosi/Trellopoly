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

function loadOrganization() {
  var organization = $('#organizationName').val()
  console.log(organization);
}

$("#button").click(function() {
  var organization = $('#organizationName').val()
  $.ajax({
  url: '/api/trello/o/' + organization,
  success: function(res) {
    
  },
  error: function(err) {

  }
});

})
