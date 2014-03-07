/* App class: Manage app */

var App = {};

// Get HTML code of the app at the given position
App.getCode = function(id, column, position) {
  var app = Storage.get('installedApps')[id];
  var html = '<div class="app '+id.replace(".", "-")+'" id=' + id.replace(".", "-") + column + position + ' data-id=' + id + ' style="color:' + app.color + '; background:' + app.background + ';"> \
              <div class="app-header"><span class="minSpin"></span>' + app.name;
  if (typeof app.expand !== 'undefined' && app.expand !== false)
    html += '<span class="expand" onclick="App.expand(\'' + id + '\')"></span>';
  html += '</div><div class="app-content"><iframe allowtransparency="true" frameborder="0" style="height:' + app.height + ';" onload="App.loaded(this.parentNode.parentNode)"';
  /*if (app.sandbox === true || typeof app.sandbox === 'undefined')
    html += 'sandbox="allow-forms allow-scripts" ';*/
  id = id.replace("holalabs.", "");
  var appurl = (typeof app.exturl == 'string') ? app.exturl : app.url.slice(0, app.url.lastIndexOf("/"));
  //var url = (typeof app.url == 'string') ? encodeURI(app.url) : 'apps/' + id + '/index.html';
  html += 'src="' + appurl + '"></iframe></div></div>';
  return html;
};

//Hide the spinner when the app is loaded
App.loaded = function(el) { $(el).find('.minSpin').fadeOut(); };

// Add the app to the given position
App.add = function(id, workspaceIndex, column, position) {
  if (typeof column == 'undefined' && typeof position == 'undefined')
    column = position = 0;
  $($('#workspace' + workspaceIndex).children()[column]).append(App.getCode(id, column, position));
  var vid = id.replace(".", "-");
  $('#' + vid + column + position).data('id', id);
  setTimeout(function() {
    $('#' + vid + column + position).find('.app-content').animate({height: $('#' + vid + column + position).find('iframe').height()}, {duration: 500});
  }, 1000);
};

// Expand the app in a new window
App.expand = function(id) {
  var app = Storage.get('installedApps')[id];
  var appurl = app.url.slice(0, app.url.lastIndexOf("/"));
  var url = (typeof app.expand == 'string') ? app.expand : appurl + '/index.html';
  window.open(url, id, 'toolbar=no, location=no, directories=no, status=no,menubar=no');
};

// Get the index of the app regard its id
App.getIndex = function(el) {
  var app = el[0] || el,
      apps = $(".app."+app.dataset.id.replace(".", "-")),
      counter = 0;
  for (var i = 0; i < apps.length; i++) {
    if (app.id === $(apps[i]).attr('id'))
      return counter;
    counter++;
  }
};

App.getFrame = function(e) {
  var frames = document.getElementsByTagName('iframe'),
      frameId = 0,
      framesLength = frames.length;

  for (; frameId < framesLength; frameId++) {
    if (frames[frameId].contentWindow === e.source) {
      return frames[frameId];
    }
  }

  return null;
}

App.updatePos = function(frame) {
  
}