/* Network class */

var Network = {};

Network.get = function(url, callback) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.open('GET', url, true);
    } else if (typeof XDomainRequest != 'undefined') {
      xhr = new XDomainRequest();
      xhr.open('GET', url);
    } else {
      callback(418, null);
      return;
    }
    xhr.onload = function() {
      callback(xhr.status, JSON.parse(xhr.responseText));
    }
    xhr.onerror = function() {
      // Cause I'm a teapot
      callback(418, null);
    }
    xhr.send(null);
};

Network.getSync = function(url, callback) {
    //Prueba
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr)
      xhr.open('GET', url, false);
    else if (typeof XDomainRequest != 'undefined')
      xhr = new XDomainRequest(),
      xhr.open('GET', url, false);
    else
      return 418;
    xhr.send(null);
    return JSON.parse(xhr.responseText);
};

Network.post = function(url, options, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  var params = "";
  for (var param in options) {
    params += param + "=" + options[param] + "&";
  }
  xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200)
				callback(xhr.status, JSON.parse(xhr.responseText));
			else {
				// Cause I'm a teapot
				callback(418, xhr.responseText);
			}
		}
	};
  xhr.send(params);
};

Network.online = function() {
  if (navigator && navigator.onLine !== undefined)
    return navigator.onLine;
  try {
    var request = new XMLHttpRequest();
    request.open('GET', '/', false);
    request.send(null);
    return (request.status === 200);
  } catch (e) {
    return false;
  }
};
