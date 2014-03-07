/**
* Initializes your app using Holadesk's framework. 
* The framework lets you manage your app's storage without caring about instances, display notifications and (very soon) share content and communicate with other apps
*
* @class DeskApp
* @constructor
*/
function DeskApp() {

  var _this = this;

  this.getId(function(id) {
    _this.id = id;

    _this.index(function(w, index) {
      if (localStorage.getItem(w+id+'Instances') == null)
        localStorage.setItem(w+id+'Instances', JSON.stringify([]));
    });
  });

  window.addEventListener("message", function(e){
    var data = e.data.split(":");
    if (data[0] == "updateIndex") {
      var isnew = data[1],
          oldPos = parseInt(data[2]),
          newPos = parseInt(data[3]);
      
      _this.reorderStorage(/^true$/i.test(isnew), oldPos, newPos);
    } else if (data[0] == "delete") {
      var pos = parseInt(data[1]);
      _this.deleteStorage(pos);
    }
  }, false);
}

DeskApp.prototype.getId = function(callback) {
  var returned = function(e){
    var data = e.data.split(":");
    if (data[0] == "id") {
      window.removeEventListener('message', returned, false);
      callback(data[1]);
    }
  };
  window.addEventListener("message", returned, false);

  window.parent.postMessage("id", window.location);
};

DeskApp.prototype.index = function(callback) {
  var returned = function(e){
    var data = e.data.split(":");
    if (data[0] == "index") {
      window.removeEventListener('message', returned, false);
      callback(parseInt(data[1]), parseInt(data[2]));
    }
  };
  window.addEventListener("message", returned, false);

  window.parent.postMessage("index", window.location);
};

DeskApp.prototype.reorderStorage = function(isnew, oldPos, newPos) {
  var _this = this;
  this.index(function(w, index) {
    var instances = JSON.parse(localStorage.getItem(w+_this.id+'Instances'));
    var newInstances = instances.slice(0);
    if (isnew) {
      var pos = oldPos;
      newInstances[pos] = null;
      for (var i = pos; i < instances.length; i++)
        newInstances[i + 1] = instances[i];
    } else {
      newInstances[newPos] = instances[oldPos];
      if (oldPos > newPos) {
        for (var i = newPos; i < oldPos; i++)
          newInstances[i + 1] = instances[i];
      } else if (oldPos < newPos) {
        for (var i = newPos; i > oldPos; i--)
          newInstances[i - 1] = instances[i];
      }
    }
    Storage.set(w+_this.id+'Instances', JSON.stringify(newInstances));
  });
};

DeskApp.prototype.deleteStorage = function(pos) {
  var _this = this;
  this.index(function(w, i) {
    var instances = JSON.parse(localStorage.getItem(w+_this.id+'Instances'));
    if (typeof instances[pos] === 'undefined')
      return;
    var newInstances = instances.slice(0);
    newInstances.splice(pos, 1);
    for (var i = pos; i > instances.length; i++)
      newInstances[i] = instances[i + 1];
    Storage.set(w+_this.id+'Instances', JSON.stringify(newInstances));
  });
};

/**
* Gets the value of a key stored in app's storage. 
* Each instance is isolated so you don't have to worry about in which instance you are. 
*
* @method get
* @param {String} key Key
* @param {Function} callback A callback function to return the value
*/
DeskApp.prototype.get = function(key, callback) {
  var _this = this;
  this.index(function(w, index) {
    var instance = JSON.parse(localStorage.getItem(w+_this.id+'Instances'));
    if (typeof instance === 'undefined' || instance === null || typeof instance[index] === 'undefined' || typeof instance[index][key] === 'undefined')
      callback(null);
    else
      callback(instance[index][key]);
  });
};

/**
* Sets the value of a key in app's storage. 
* Each instance is isolated so you don't have to worry about in which instance you are
*
* @method set
* @param {String} key Key
* @param {mixed} value Value to set
*/
DeskApp.prototype.set = function(key, value) {
  var _this = this;
  this.index(function(w, index) {
    var instances = JSON.parse(localStorage.getItem(w+_this.id+'Instances')),
        instance = instances[index];
    if (typeof instance === 'undefined' || instance == null)
      instance = {};
    instance[key] = value;
    instances[index] = instance;
    Storage.set(w+_this.id+'Instances', JSON.stringify(instances));
  });
};

/**
* Deletes the value of a key in app's storage. 
* Each instance is isolated so you don't have to worry about in which instance you are
*
* @method del
* @param {String} key Key
*/
DeskApp.prototype.del = function(key) {
  var _this = this;
  this.index(function(w, index) {
    var instances = JSON.parse(localStorage.getItem(w+_this.id+'Instances')),
        instance = instances[index];
    delete instance[key];
    instances[index] = instance;
    localStorage.setItem(w+_this.id+'Instances', instances);
  });
};

/**
* Clears app's storage. 
* Each instance is isolated so you don't have to worry about in which instance you are
*
* @method clear
*/
DeskApp.prototype.clear = function() {
  var _this = this;
  this.index(function(w, index) {
    var instances = JSON.parse(localStorage.getItem(w+_this.id+'Instances'));
    delete instances[index];
    localStorage.setItem(w+_this.id+'Instances', instances);
  });
};

/**
* Displays a notification in Holadesk.
* It will display a web notification if the user is running the web version, an Android one if the user is on Android and so on.
*
* @method notify
* @param {String} title Title
* @param {String} msg Message
*/
DeskApp.prototype.notify = function(title, msg) {
  window.parent.postMessage("notif:"+encodeURI(title)+":"+encodeURI(msg), window.location);
};

DeskApp.prototype.share = function(content) {
  window.parent.postMessage("share:"+encodeURI(content), window.location);
};