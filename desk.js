var debug = false,
    url = (debug) ? 'http://localhost:2223/' : 'https://desk.holalabs.com/';

var isweb = false,
    isdesktop = false,
    Native;

var Native;

NativeDesk.init();

$(function() {

  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || /Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
    alert("Your browser is not supported. We are working hard to improve the support for your browser.");
  }

  // Loading image
  var interval = setInterval(function() { $('#icon2').fadeToggle(500); }, 500);
  setTimeout(function() {
    clearInterval(interval);
    $("#icon2").fadeOut(1);
  }, 2000);

  if (Storage.get('user')) {
    init();
    setRouter();
  } else {
    $('.logged').hide();
    $('#login, #register').submit(function(e) {
      form(e.target.id); return false;
    });
    setTimeout(function() {
      $('#icon').addClass("floatLeft");
      $('.notlogged, #login').fadeIn(1000);
    }, 2000);

    Storage.initNotLogged();

    for(var username in Storage.get('users')) {
      var img = Storage.get("usersImages")[username];
      $("#users").append('<div onclick="$(\'#username\').val(\''+username+'\'); $(\'#password\').focus()"><img src="' + img + '"/>'+username+'</div>');
    }
  }
});

activate = function(el) {
  $('.notlogged form').fadeOut(100, function() { $('#'+el).fadeIn(); });
}

form = function(action) {
  if (action == "login") {
    var params = {'username': $('#username').val(), 'password': $('#password').val()};
    User.login(params);
  } else {
    var params = {'username': $('#regUsername').val(), 'email': $('#regEmail').val(), 'password': $('#regPassword').val()};
    User.register(params);
  }
}

forgot = function() {
  $("#popup h1").text("Recover your password");
  $("#popup p").html('<form id="forgot"> \
    <input type="text" id="forgotemail" placeholder="Email"></form>');
  $('#popup').click(function() { event.stopPropagation(); });
  $('#popup .buttons').click(function() { hidePopup(); });
  $("#popup .buttons").html('<button>Cancel</button><button id="recover">Recover</button>');
  $("#cover").show();
  $("#popup").slideDown();
  $("#popup button#recover").click(function() {
    $("#forgot").submit();
  });
  $("#forgot").submit(function() {
    var params = {"email": $("#forgotemail").val(), "endpoint": true};
    User.forgot(params);
    return false;
  });
}


updateSelectorLabel = function(index) {
  $('#workspaceName').text(Storage.get('workspaces')[index].name);
}

updateSelector = function() {
  var workspaces = Storage.get('workspaces');
  $('#workspaceName').text(workspaces[Storage.get('currentWorkspace')].name);
  var spaces = '';
  for (var i = 0; i < workspaces.length; i++) {
      spaces += '<div data-id="'+i+'"><li>' + workspaces[i].name + '<button class="edit"></button></li> \
             <div style="display:none;"> \
           <input type="text" onkeyup="Workspaces.rename(' + i + ', this.value)"/> \
           <button onclick="Workspaces.remove(' + i + ')" class="delete"></a> \
           <button onclick="toggleEdit(this.parentNode.parentNode, ' + i + ')" class="tick"></button></div></div>';
  }
  $('#workspaceList').html(spaces);

  $("#workspaceList li").click(function() {
    Workspaces.load($(this.parentNode).attr("data-id"));
  });
  $("#workspaceList .edit").click(function() {
    toggleEdit(this.parentNode.parentNode, $(this.parentNode.parentNode).attr("data-id"));
  });
}

toggleEdit = function(entry, i) {
  if ($(entry).find('.edit').is(':visible'))
    $(entry).find('input').val(Storage.get('workspaces')[i].name);
  else {
    $(entry).find('li').html($(entry).find('input').val() + '<button class="edit"></button>');
    $(entry).find(".edit").click(function() {
      toggleEdit(this.parentNode.parentNode, $(this.parentNode.parentNode).attr("data-id"));
    });
  }
  $(entry).find('li, div').toggle();
  event.stopPropagation();
};

setRouter = function() {
    var routes = { '/deskapp/:id': Apps.openAvailableView },
      router = Router(routes);
    router.init();
};

hidePopup = function() {
  $('#popup').slideUp();
  $('#cover').hide();
};

theme = function(color) {
  holadeskTheme(color);
  holadeskTheme(color);
  Storage.set('theme', color);
}

showSettings = function() {
  $("#popup h1").text("Settings");
  $("#popup p").html('<form id="settings"> \
    <input type="text" id="username1" placeholder="New username"> \
    <input type="password" id="password2" placeholder="New Password"> \
    <input type="password" id="password1" placeholder="Old Password"></form>');
  $('#popup').click(function() { event.stopPropagation(); });
  $('#popup .buttons').click(function() { hidePopup(); });
  $("#popup .buttons").html('<button>Save</button>');
  $("#cover").show();
  $("#popup").slideDown();
  $("#popup button").click(function() {
    $("#settings").submit();
  });
  $("#settings").submit(function() {
    var params = {"email": Storage.get("email"), "username": $("#username1").val(), "password1": $("#password1").val(), "password2": $("#password2").val()};
    for (var param in params) {
      if (params[param] == "")
        delete params[param];
    }
    User.settings(params);
    return false;
  });
}

showAbout = function() {
  if (!$("#about").is(":visible"))
    $("#about").addClass("current");
  else
    $("#about").removeClass("current");
}

function init() {

  $('#icon').removeClass("floatLeft");//.addClass("floatRight");
  $('#icon').animate({
    marginLeft:'-64px',
    marginTop:'-128px'
  }, 1000);
  setTimeout(function() {
    $("header").slideDown('slow');
    $("#icon").fadeOut('slow');
  }, 2000);

  $('.notlogged').hide();

  Storage.initLogged();

  theme(Storage.get("theme"));
  updateSelector();
  updateSelectorLabel(Storage.get('currentWorkspace'));

  holadeskUI();
  // Check if we're using the web app or the desktop app
  Workspaces.load(Storage.get('currentWorkspace'));

  Sync.init();
  Apps.update();
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
  //console.log(event.source.frameElement.parentNode.parentNode.getAttribute('data-id'));
  var data = event.data.split(":"),
      frame = App.getFrame(event).parentNode.parentNode,
      id = frame.getAttribute('data-id'),
      index = App.getIndex(frame);

  if (data[0] == "id") {
    event.source.postMessage("id:"+id, "*");
  } else if (data[0] == "index") {
    event.source.postMessage("index:"+Storage.get('currentWorkspace')+":"+index, "*");
  } else if (data[0] == "notif") {
    notify(decodeURI(data[1]), decodeURI(data[2]), id, 2000);
  }
}