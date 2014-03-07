/* Apps class: Manage apps, app store and list of apps */

var Apps = {};

// Render app list. type: app or available
Apps.renderList = function() {
  var apps = Storage.get('installedApps');
  $('#appList').html('');
  $.each(apps, function(id, app) {
    var appid = id.replace(".", "-");
    var appurl = app.url.slice(0, app.url.lastIndexOf("/"));
    var html = '<div id="app' + appid + '" class="appEntry" data-id="' + id + '"><img src="' + appurl + '/icon.png" />' + app.name + '</div>';
    $('#appList').append(html);
    $('#app' + appid).click(function() {
      Apps.openView(id);
      event.stopPropagation();
    });
  });
  $('#appList .appEntry').draggable({
    helper: 'clone',
    connectToSortable: '.column',
    cursor: 'move',
    start: function(event, ui) {
      $(ui.helper).attr('id', $(this).attr('data-id'));
      window.tmpId = $(this).attr('data-id');
      $(ui.helper).attr('class', 'app').html('<div class="app-header">' + $(ui.helper).text() + '</div>').width(320).height(30);
      $('#workspace' + Storage.get('currentWorkspace')).find('.column').first().append($(ui.helper));
      Apps.toggleSelector();
      $('.column').sortable('refresh');
      $('.ui-sortable-placeholder').width(320).height(30);
    }
  }).disableSelection();
};

// Toggle apps selector
Apps.toggleSelector = function() {
  $('#apps').slideToggle();
  if ($('#apps').is(':visible') && $('#appList').children().length < 1)
    Apps.renderList();
};

// Open app view
Apps.openView = function(id) {
  var app = Storage.get('installedApps')[id];
  var id = app.id;
  var appurl = app.url.slice(0, app.url.lastIndexOf("/"));
  $('#cover').show();
  $('#appViewHeader img').attr('src', appurl + '/icon.png');
  $('#appViewHeaderInfo h1').text(app.name);
  $('#appViewHeaderInfo h5').text(app.description);
  $('#appViewAuthor').text(app.author);
  $('#appViewVersion').text(app.version);
  if (typeof Storage.get('installedApps')[id] === 'undefined') {
    $('#appViewButton').attr('class', 'green');
    $('#appViewButton').attr('onclick', "javascript:Apps.install('" + id + "')");
    $('#appViewButton').text('Install');
  } else {
    $('#appViewButton').attr('class', 'red');
    $('#appViewButton').attr('onclick', "javascript:Apps.uninstall('" + id + "')");
    $('#appViewButton').text('Uninstall');
  }
  var text = encodeURIComponent(app.name + ' for holadesk ' + 'https://desk.holalabs.com/deskapp/' + id);
  $('#facebookShareApp').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + text);
  $('#twitterShareApp').attr('href', 'https://twitter.com/intent/tweet?status=' + text);
  $('#googleShareApp').attr('href', 'https://plus.google.com/share?url=' + text);
  $('#appView').fadeIn();
  $('#cover').one('click', function() { Apps.hideView(); });
};

Apps.hideView = function() {
  $('#cover').hide();
  $('#appView').fadeOut();
};

Apps.search = function() {
  $('#appList div').show();
  if ($('#searchApps').val() != '') {
    $('#appList div').filter(function(index) {
      if ($(this).text().toLowerCase().indexOf($('#searchApps').val().toLowerCase()) == -1)
        return true;
    }).hide();
  }
};

/*Apps.install = function(id) {
  var name = availableApps[id].name;
  showConfirm('Are you sure?', 'You are going to install: ' + name, 'Install', 'green', function() {
    Apps.hideView();
    var apps = Storage.get('installedApps');
    apps[id] = availableApps[id];
    Storage.set('installedApps', apps);
    Apps.show('app');
    Apps.renderList('app', apps);
    $('#installedAppsButton').attr('class', 'g-button checked');
    $('#availableAppsButton').attr('class', 'g-button');
    setTimeout(function() { $('#' + id).effect('bounce', { times: 3 }, 300); }, 2000);
    notify('App installed', name + ' is now installed', 'apps/' + id + '/icon.png', 3000);
  });
};*/

Apps.install = function(id) {
  Apps.installUrl(id, url+"store/app/"+id+"?endpoint=true");
  Apps.toggleMode();
  setTimeout(function() { $('#' + id).effect('bounce', { times: 3 }, 300); }, 2000);
  Native.notify('App installed', id + ' is now installed', 3000);
}

Apps.installUrl = function(id, manifest) {
  Network.get(manifest, function(status, app) {
    var apps = Storage.get('installedApps');
    app.id = id;
    apps[id] = app;
    Storage.set('installedApps', apps);
    Apps.renderList();
  });
};

Apps.defaults = function() {
  var ids = ["postit", "calc", "canvas", "checklist", "clip", "clock", "facebook", "linkedin", "nokiamaps", "twitter", "grooveshark"];
  for (var i=0; i<ids.length; i++) {
    Apps.installUrl("holalabs."+ids[i], url+"store/app/holalabs."+ids[i]+"?endpoint=true");
  }
}

Apps.uninstall = function(id) {
  var apps = Storage.get('installedApps');
  var name = apps[id].name;
  Native.showConfirm('Are you sure?', 'You are going to uninstall: ' + name + "\nAll the app's data will be lost!", 'Uninstall', 'red', function() {
    Apps.hideView();
    delete apps[id];
    Storage.set('installedApps', apps);
    var workspaces = Storage.get('workspaces');
    workspaces.forEach(function(workspace, i) {
      if (typeof workspace.storage[id] != 'undefined')
        delete workspace.storage[id];
      workspace.apps.forEach(function(apps, y) {
        apps.forEach(function(app, x) {
          if (app.id == id) {
            delete apps[x];
          }
        });
      });
    });
    Storage.set('workspaces', workspaces);
    $('#installedAppsButton').attr('class', 'g-button checked');
    $('#availableAppsButton').attr('class', 'g-button');
    $('#app' + id).hide('drop', { direction: 'down' }, 1000);
    Apps.renderList();
    Workspaces.reload(Storage.get('currentWorkspace'));
  });
};

Apps.update = function() {
  var apps = Storage.get('installedApps'),
      list = [];
  for (var x in apps) {
    list.push(x);
  }
  Network.post(url+'store/update', {apps: list.toString()}, function(status, versions) {
    if (status !== 200)
      return;
    for (var x in apps) {
      if (apps[x].version < versions[apps[x].id])
        Apps.install(apps[x].id);
    }
  });
}

Apps.toggleMode = function() {
  if ($('#store').is(':visible')) {
    $('#store').fadeOut('slow', function() {
      $('#appListToolbar').fadeIn();
      $('#appList').fadeIn();
      $('#apps').height("auto");
    });
  } else {
    if ($("#store").length == 0)
      $("#apps").append('<iframe id="store" src="'+url+'store"></iframe>');
    $('#appListToolbar, #appList').fadeOut('slow', function() {
      $('#store').fadeIn();
      $('#apps').height("100%");
    });
  }
}