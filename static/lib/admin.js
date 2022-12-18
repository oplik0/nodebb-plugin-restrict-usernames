'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /admin/plugins/restrict-usernames page
	It is not bundled into the min file that is served on the first load of the page.
*/
define('admin/plugins/restrict-usernames', [
	'settings', 'uploader',
], function (settings, uploader) {
	var ACP = {};

	ACP.init = function () {
		setupUploader();
		settings.load('restrict-usernames', $('.restrict-usernames-settings'), function () {
			setupColorInputs();
		});
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('restrict-usernames', $('.restrict-usernames-settings')); // pass in a function in the 3rd parameter to override the default success/failure handler
	}

	function setupColorInputs() {
		var colorInputs = $('[data-settings="colorpicker"]');
		colorInputs.on('change', updateColors);
		updateColors();
	}

	function updateColors() {
		$('#preview').css({
			color: $('#color').val(),
			'background-color': $('#bgColor').val(),
		});
	}

	function setupUploader() {
		$('#content input[data-action="upload"]').each(function () {
			var uploadBtn = $(this);
			uploadBtn.on('click', function () {
				uploader.show({
					route: config.relative_path + '/api/admin/upload/file',
					params: {
						folder: 'restrict-usernames',
					},
					accept: 'image/*',
				}, function (image) {
					$('#' + uploadBtn.attr('data-target')).val(image);
				});
			});
		});
	}

	return ACP;
});
