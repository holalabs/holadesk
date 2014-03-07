/* Storage class */

var Storage = {};

Storage.ready = false;
Storage.ready = (localStorage.getItem('updated') !== null) ? true : false;

Storage.initNotLogged = function() {
  var keys = {'users': {}, 'usersImages': {}};
  for (var key in keys) {
    if (!Storage.get(key))
      Storage.set(key, keys[key]);
  }
}

Storage.initLogged = function() {
  var keys = {'workspaces': [], 'installedApps': {}}
  for (var key in keys) {
    if (Storage.get(key) !== null)
      return;
    Storage.set(key, keys[key]);
    if (key == 'workspaces')
      Workspaces.add();
    else if (key == 'installedApps')
      Apps.defaults();
  }
}

Storage.notifyUpdate = function(key) {
  if (key !== "updated" && key !== "" && Storage.ready == true) {
      localStorage.setItem("updated", JSON.stringify(new Date()));
      Sync.synced = false;
  }
};

Storage.set = function(key, value) {
  Storage.notifyUpdate(key);
  return localStorage.setItem(key, JSON.stringify(value));
};

Storage.get = function(key) {
  return JSON.parse(localStorage.getItem(key));
};

Storage.del = function(key) {
  Storage.notifyUpdate(key);
  return localStorage.removeItem(key);
};

Storage.clear = function() {
  return localStorage.clear();
};

// Reorder storage when dragging and dropping apps
Storage.reorderAppStorage = function(isnew, id, oldPos, newPos) {
  if ($(".app."+id.replace(".", "-")+' iframe').length == 0)
    return;
  $(".app."+id.replace(".", "-")+' iframe:visible')[0].contentWindow.postMessage("updateIndex:"+isnew+':'+oldPos+':'+newPos, window.location);
};

Storage.deleteAppStorage = function(id, pos) {
  $(".app."+id.replace(".", "-")+' iframe:visible')[0].contentWindow.postMessage("delete:"+pos, window.location);
};

Storage.export = function() {
  var storage = {};
  for (var key in localStorage) {
    if (key != "users" && key != "usersImages")
      storage[key] = localStorage[key];
  }
  return storage;
}

Storage.import = function(data) {
  for (var key in data) {
    if (key == "users" || key == "usersImages")
      return;
    localStorage[key] = data[key];
  }
}