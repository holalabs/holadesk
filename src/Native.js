var NativeDesk = {};

NativeDesk.platform = 'Web';

NativeDesk.init = function() {
  if (typeof Native !== 'undefined') {
    if (navigator.userAgent.indexOf('Qt') !== -1) {
      NativeDesk.platform = 'Desktop';
      Native.showInfo = NativeDesk.showInfo;
    } else if (navigator.userAgent.indexOf('Android') !== -1) {
      NativeDesk.platform = 'Android';
      console.log(NativeDesk.platform);
    } else if (navigator.userAgent.indexOf('iOS') !== -1) {
      NativeDesk.platform = 'iOS';
      Native.showInfo = NativeDesk.showInfo;
    }
    Native.showConfirm = NativeDesk.showConfirm;
  } else {
    Native = NativeDesk;
  }
}

NativeDesk.notify = function(title, msg) {
  var notif = window.parent.$.meow({
    title: title,
    message: msg,
    closeable: true
  });
}

NativeDesk.buildPopup = function(title, text) {
  $("#popup h1").text(title);
  $("#popup p").text(text);
  $('#popup').click(function() { event.stopPropagation(); });
  $('#popup .buttons').click(function() { hidePopup(); });
}

NativeDesk.showConfirm = function(title, text, buttonText, buttonClass, callback) {
  NativeDesk.buildPopup(title, text);
  $("#popup .buttons").html('<button>Cancel</button><button class="'+buttonClass+'">'+buttonText+'</a>');
  $("#cover").show();
  $("#popup").slideDown();
  $("#popup .buttons ."+buttonClass).click(callback);
}

NativeDesk.showInfo = function(title, text) {
  NativeDesk.buildPopup(title, text);
  $("#popup .buttons").html('<button>OK</button>');
  $("#cover").show();
  $("#popup").slideDown();
}