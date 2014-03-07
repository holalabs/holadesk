/* User class: Profile stuff */

var User = {};

User.image = function(email) {
	return "https://secure.gravatar.com/avatar/" + Security.md5(email.trim().toLowerCase()) + "?d=mm";
}

User.save = function() {
	var users = Storage.get("users");
	users[Storage.get("user")] = Storage.get("email");
	Storage.set("users", users);
}

User.login = function(params) {
  var users = Storage.get("users");
  var oldUsers = ["mitchell", "martin", "licuende", "izqui9", "pol.tarrago", "merten", "lorena", "demo", "urtotorras", "oscar", "jaimebravo", "richiguada"];
  if (!!~oldUsers.indexOf(params.username) == true && Storage.get("users") == null) {
    Storage.clear();
    Storage.set("empty", true);
    window.location.reload();
  }
  if (params.username in users) {
    var data = Security.decrypt(users[params.username], params.password);
    try {
      data = JSON.parse(data);
      Storage.import(data);
      init();
    } catch (e) {
      Native.showInfo('Error', "Incorrect password");
    }
  } else {
    Network.post(url+"api/login", params, function(status, res) {
      if (res.success == true) {
        Network.get(url+'api/emailconfirmed?username='+params.username, function(status2, res2) {
          if (res2 != null && res2.success == true) {
            var email = JSON.parse(res.user).email;
            Storage.set('user', params.username);
            Storage.set('email', email);
            Storage.set('password', Security.encryptPassword(params.password));
            users[params.username] = "";
            Storage.set('users', users);
            init();
          } else {
             Native.showInfo('Error', "In order to use holadesk, you need to go to inbox and confirm your email. If you can't find the automatic email sent to you, please check your spam folder.");
          }
        });
      } else {
        Native.showInfo('Error', res.error || "Unknown error");
      }
    });
  }
}

User.register = function(params) {
  Network.post(url+"api/register", params, function(status, res) {
    if (res.success == true) {
      $("#regUsername").val('');
      $("#regEmail").val('');
      $("#regPassword").val('');
      activate('login');
      Native.showInfo('Success!', "Your are now registered! You just need to go to inbox and click the link in the confirmation email. If you can't find the automatic email sent to you, please check your spam folder.");
    } else {
      Native.showInfo('Error', res.error || "Unknown error");
    }
  });
}

User.settings = function(params) {
  Network.post(url+"api/account", params, function(status, res) {
    if (res.success == true) {
      if (params.username && Storage.get('user') != params.username) {
        var users = Storage.get('users');
        users[params.username] = users[Storage.get('user')];
        delete users[Storage.get('user')];
        Storage.set('users', users);
        Storage.set('user', params.username);
      } else if (params.password2 && params.password2 != Security.password()) {
        Storage.set("password", Security.encryptPassword(params.password2));
      }
      //window.parent.location.reload();
      Native.showInfo('Success', "Settings correctly changed!");
    } else
      Native.showInfo('Error', res.error || "Unknown error");
  });
}

User.forgot = function(params) {
  Network.post(url+"store/forgot", params, function(status, res) {
    if (res.success == true) {
      Native.showInfo('New password sent', "Check your inbox, and if it\'s not there, check your spam folder.");
      var users = Storage.get('users');
      delete users[res.username];
      Storage.set('users', users);
    } else
      Native.showInfo('Error', res.error || "Unknown error");
  });
}

User.logout = function() {
  if (!Network.online()) {
    Native.showInfo('You are offline', "You cannot be logged out because there is no Internet connection so we wouln't be able to log you in if you log out");
    return;
  }
  var storage = Security.encrypt(JSON.stringify(Storage.export()), Security.password()),
      username = Storage.get("user"),
      email = Storage.get("email"),
      users = Storage.get("users"),
      uimages = Storage.get("usersImages");
  Storage.clear();
  users[username] = storage;
  uimages[username] = User.image(email);
  Storage.set("users", users);
  Storage.set("usersImages", uimages);
  window.location.reload();
}