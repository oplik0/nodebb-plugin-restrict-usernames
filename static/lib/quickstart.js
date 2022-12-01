'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /restric-usernames page
	It is not bundled into the min file that is served on the first load of the page.
*/

define('forum/restric-usernames', function () {
	var module = {};
	module.init = function () {
		$('#last-p').text('restric-usernames.js loaded!');
	};
	return module;
});
