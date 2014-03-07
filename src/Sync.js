/* Sync class: Here we'll implement all the shit stuff for syncing Holadesk */

var Sync = {};

Sync.synced = false;

Sync.init = function() {
	Sync.get();
}

Sync.post = function() {
	var username = Storage.get("user");
	var data = Storage.export()
	if (typeof data.password !== "undefined")
		delete data.password;
	Network.post(url+'api/data', {'username': username, 'password': Security.password(), 'data': JSON.stringify(data) }, function(status, res) {
		if (status != 200)
			Native.showInfo('Error', res || res.error);
		else
			Storage.ready = true;
			Sync.synced = true;
	});
}

Sync.get = function () {
	var username = Storage.get("user");
	Network.get(url+'api/data?username=' + username + '&password=' + Security.password(), function(status, res) {
		if (res.success == true) {
			var data;
			try {
				data = JSON.parse(res.data);
			} catch (err) {
				data = {};
			}
			console.log(data.updated >= currentUpdated);
			console.log(Storage.ready == false && typeof data.currentWorkspace !== 'undefined');
			console.log(data.currentWorkspace);
			console.log(Storage.ready);

			var currentUpdated = JSON.stringify(Storage.get("updated"));
			if (data.updated >= currentUpdated || (Storage.ready == false && typeof data.updated !== "undefined")) {
				if (typeof data.password !== "undefined")
					delete data.password;
				Storage.import(data);
				Storage.ready = true;
				//Native.showInfo('Sync', "Sync completed!");
				window.parent.location.reload();
			} else if (Sync.synced == false) {
				if (Storage.ready == false)
					localStorage.setItem("updated", JSON.stringify(new Date));
				Sync.post();
			}
		} else if (status > 400)
			Native.showInfo('Error', res || res.error);
	});
}