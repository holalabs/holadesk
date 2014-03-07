/* Workspaces class: Workspace management */

var Workspaces = {};

Workspaces.add = function() {
  var workspaces = Storage.get('workspaces'),
      index = workspaces.length;
  workspaces[index] = {'name': 'Workspace ' + index, 'apps': [], 'storage': {}};
  Storage.set('workspaces', workspaces);
  Workspaces.load(index);
  updateSelector();
};

Workspaces.remove = function(index) {
  Native.showConfirm('Are you sure?', 'Removing a workspace is permanent', 'Delete', 'red', function() {
    if (index == 0) return;

    var workspaces = Storage.get('workspaces');
    workspaces.splice(index, 1);
    Storage.set('workspaces', workspaces);
    if (Storage.get('currentWorkspace') == index) {
      Storage.set('currentWorkspace', (typeof workspaces[index - 1] !== 'undefined') ? index - 1 : index + 1);
      Workspaces.load(Storage.get('currentWorkspace'));
    }
    updateSelector();
  });
};

Workspaces.load = function(index) {
  if ($('#workspace' + index).css('visibility') == 'visible') return;
  $('#workspace' + Storage.get('currentWorkspace')).css({position: 'absolute', left: '-10000px', visibility: 'hidden'});
  if (!$('#workspace' + index)[0]) {
    var workspace = Storage.get('workspaces')[index];
    $('#desk').append('<div id="workspace' + index + '" data-name="' + workspace.name + '"></div>');
    workspace.apps.forEach(function(column) {
      $('#workspace' + index).append('<div class="column"></div>');
      $(column).each(function() {
        if (typeof Storage.get('installedApps')[this.id] !== 'undefined')
          App.add(this.id, index, this.column, this.position);
      });
    });
    //$('#desk').width(workspace.apps.length * 330 + 330);
    $('#workspace' + index).append('<div class="column"></div>');
    Workspaces.set(index);
  }
  $('#desk').width($('#workspace' + index).find(".column").length * 330 + 330);
  $('#workspace' + index).css({position: '', left: ''});
  $('#workspace' + index).css({opacity: 0.0, visibility: 'visible'}).animate({opacity: 1.0}, {duration: 500});
  Storage.set('currentWorkspace', index);
  updateSelectorLabel(index);
};

Workspaces.reload = function(index) {
  if ($('#workspace' + index).css('visibility') !== 'visible') return;
  $('#workspace' + index).slideToggle().remove();
  if (!$('#workspace' + index)[0]) {
    var workspace = Storage.get('workspaces')[index];
    $('#desk').append('<div id="workspace' + index + '" data-name="' + workspace.name + '"></div>');
    workspace.apps.forEach(function(column) {
      $('#workspace' + index).append('<div class="column"></div>');
      $(column).each(function() {
        if (typeof Storage.get('installedApps')[this.id] !== 'undefined')
          App.add(this.id, index, this.column, this.position);
      });
    });
    $('#workspace' + index).append('<div class="column"></div>');
    Workspaces.set(index);
  }
  $('#desk').width($('#workspace' + index).find(".column").length * 330 + 330);
  $('#workspace' + index).css({position: '', left: ''});
  $('#workspace' + index).css({opacity: 0.0, visibility: 'visible'}).animate({opacity: 1.0}, {duration: 500});
  updateSelectorLabel(index);
};

Workspaces.save = function(index, callback) {
  var workspaces = Storage.get('workspaces'),
      columns = new Array();
  if ($('#workspace' + index).length > 0) {
    var notempty = 0;
    $('#workspace' + index + ' .column').each(function(col) {
      var apps = new Array();
      $(this).children().each(function(pos) {
        var id = $(this).attr('data-id'),
            app = {
          'id': id,
          'workspace': workspace,
          'column': col,
          'position': pos
        };
        apps.push(app);
      });
      if (apps.length > 0) notempty = ++col;
      columns.push(apps);
    });
    columns.splice(notempty, columns.length - notempty);
  }
  var name = $('#workspace' + index).attr('data-name'),
      workspace = workspaces[index];
  workspace = {'name': name, 'apps': columns, 'storage': workspace.storage};
  workspaces[index] = workspace;
  Storage.set('workspaces', workspaces);
  if ('undefined' !== typeof callback) callback();
};

Workspaces.set = function(index) {
  $('#workspace' + index + ' .column').sortable({
    cursor: 'move',
    forcePlaceholderSize: true,
    scroll: true,
    /*scrollSensitivity: 80,
    scrollSpeed: 80,*/
    tolerance: 'pointer',
    revert: true,
    start: function(event, ui) {
      // HACK: Store start position of app
      window.oldPosTmp = App.getIndex(ui.item);
      $('#trash').show();
      $($(ui.item).find('.app-content')[0]).hide();
      $(ui.item).width(320).height(30);
    },
    beforeStop: function(event, ui) {
      // HACK: Don't do anything if the event comes from the trash
      if (typeof ui.item.parent()[0] === 'undefined') return;
      var col = $('.column').index(col),
          pos = ui.item.index();
      if (window.oldPosTmp !== pos && typeof window.oldPosTmp !== 'undefined')
        Storage.reorderAppStorage(false, $(ui.item).data('id'), window.oldPosTmp, pos);
      $(ui.item).find('.minSpin').show();
      $(ui.item).find('.app-content').height(0).show().find('iframe').attr('src', $(ui.item).find('.app-content iframe').attr('src'));
      // HACK: Wait for the storage to be ordered
      setTimeout(function() {
        $(ui.item).find('.app-content').animate({height: $(ui.item).find('iframe').height()}, {duration: 500});
      }, 100);
    },
    stop: function(event, ui) {
      // If widget is adding to the last column add a new one
      if (typeof $(ui.item).parent().next()[0] == 'undefined') {
        $('#workspace' + Storage.get('currentWorkspace')).append('<div class="column ui-sortable"></div>');
        $('#desk').width($('#desk').width() + 330);
        Workspaces.set(index);
      }
      $('#trash').hide();
      // Check if it's a list entry
      if ($(ui.item).attr('class').indexOf('appEntry') != -1) {
        $('#apps').hide();
        var id = window.tmpId;
        $(ui.item).attr('data-id', id);
        var col = $('.column').index(col),
            pos = ui.item.index();
        $(ui.item).replaceWith(App.getCode(id, col, pos));
        $(ui.item).width('auto').height('auto');
        var w = $('#' + id.replace(".", "-") + col + pos);
        Storage.reorderAppStorage(true, id, App.getIndex(w));
        setTimeout(function() {
          $(w).find('iframe').attr('src', $(w).find('iframe').attr('src'));
          $(w).find('.app-content').animate({height: $(w).find('iframe').height()}, {duration: 500});
        }, 500);
      }
      Workspaces.saveCurrent();
    }
  }).sortable('option', 'connectWith', '.column').disableSelection();
  Workspaces.setTrash();
};

Workspaces.saveCurrent = function(callback) {
  Workspaces.save(Storage.get('currentWorkspace'), function() {
    if ('undefined' !== typeof callback) callback();
  });
};

Workspaces.rename = function(i, name) {
  var workspaces = Storage.get('workspaces'),
      workspace = workspaces[i];
  workspace.name = name;
  Storage.set('workspaces', workspaces);
  var cur = Storage.get('currentWorkspace');
  if (i == cur)
    updateSelectorLabel(i);
};

Workspaces.setTrash = function() {
  $('#trash').droppable({
    accept: '.app',
    hoverClass: 'ui-state-hover',
    over: function(ev, ui) {
      $('#trash').attr('class', 'ui-state-hover');
    },
    drop: function(ev, ui) {
      ui.draggable.css("left", -1000).css("opacity", 0);
      $(ui.draggable).find('.app-content').show();
      Storage.deleteAppStorage($(ui.draggable).data('id').replace(".", "-"), window.oldPosTmp);
      setTimeout(function() { ui.draggable.remove() }, 1000);
    }
  });
};
