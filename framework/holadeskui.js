/**
* Initializes your app using Holadesk's framework. 
* The framework lets you manage your app's storage without caring about instances, display notifications and (very soon) share content and communicate with other apps
*
* @class DeskApp
* @constructor
*/
if (typeof DeskApp === 'undefined')
	DeskApp = function() {};

/**
* Inits Holadesk's UI Framework. 
*
* @method UI
*/
DeskApp.prototype.UI = holadeskUI = function() {
	var tabs = document.querySelectorAll('header nav button');
	for (var i = 0; i < tabs.length; i++) {
		var _this = this;
		tabs[i].addEventListener('click', function() {
			var section = this.getAttribute('data-section');
			document.querySelector('header nav button.current').classList.remove('current');
			document.querySelector("header nav button[data-section='" + section + "']").classList.add('current');
			_this.showSection(section);
		}, false);
	}
	if (document.querySelector('header button.menu') !== null)
		document.querySelector('header button.menu').onclick = this.toggleSideMenu || holadeskToggleSideMenu;
	var menubuttons = document.querySelectorAll('body > menu > button');
	for (var i = 0; i < menubuttons.length; i++) {
		menubuttons[i].addEventListener('click', function() {
			document.querySelector('body > menu').style.width = '145px';
			setTimeout(function() {
				document.querySelector('body > menu').style.width = '135px';
				document.querySelector('body > menu').style.left = '-135px';
			}, 200);
		}, false);
	}
	var dds = document.querySelectorAll('ul.dropdown');
	for (var i = 0; i < dds.length; i++) {
		var forb = dds[i].getAttribute("data-for");
		document.querySelector(forb).addEventListener('click', (function(d) {
			return function() {
				if (d.style.display == "none") {
					d.style.display = "block";
					setTimeout(function() { d.style.opacity = 1; }, 10);
				} else {
					d.style.opacity = 0;
					setTimeout(function() { d.style.display = "none"; }, 10);
				}
			}
		})(dds[i]), false);
	}
};

/**
* Displays the section in your app with the specified ID.
*
* @method showSection
* @param {String} id ID
*/
DeskApp.prototype.showSection = function(id) {
	document.querySelector('section.current').classList.remove('current');
	document.getElementById(id).classList.add('current');
};

/**
* Toggles the side menu.
*
* @method toggleSideMenu
*/
DeskApp.prototype.toggleSideMenu = holadeskToggleSideMenu =function() {
	if (document.querySelector('body > menu').style.left == '0px')
		document.querySelector('body > menu').style.left = '-135px';
	else
		document.querySelector('body > menu').style.left = '0px';
};

/**
* Themes your app with a compatible color.
*
* @method theme
* @param {String} color Color
*/
DeskApp.prototype.theme = holadeskTheme = function(color) {
	document.body.className = "";
	document.body.classList.add(color);
}