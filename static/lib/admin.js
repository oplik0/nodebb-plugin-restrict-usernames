'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /admin/plugins/restrict-usernames page
	It is not bundled into the min file that is served on the first load of the page.
*/
define('admin/plugins/restrict-usernames', [
	'settings',
], function (settings) {
	var ACP = {};

	ACP.init = function () {
		settings.load('restrict-usernames', $('.restrict-usernames-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('restrict-usernames', $('.restrict-usernames-settings')); // pass in a function in the 3rd parameter to override the default success/failure handler
	}

	return ACP;
});
