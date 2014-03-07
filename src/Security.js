/* Security class */

var Security = {};

Security.encrypt = function(string, password) {
	return CryptoJS.AES.encrypt(string, password).toString();
}

Security.decrypt = function(string, password) {
	return CryptoJS.AES.decrypt(string, password).toString(CryptoJS.enc.Latin1);
}

Security.md5 = function(string) {
	return CryptoJS.MD5(string).toString();
}

Security.password = function() {
	return Security.decrypt(Storage.get("password"), Storage.get("user")+"holadeskUI");
}

Security.encryptPassword = function(string) {
	return Security.encrypt(string, Storage.get("user")+"holadeskUI");
}