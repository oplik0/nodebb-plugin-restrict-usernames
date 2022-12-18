'use strict';

const meta = require.main.require('./src/meta');

const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = {};
plugin.id = 'restrict-usernames';
plugin.settings = {};
plugin.init = async (params) => {
	const { router /* , middleware , controllers */ } = params;

	// Settings saved in the plugin settings can be retrieved via settings methods
	plugin.settings = await meta.settings.get(plugin.id);
	if (!plugin.settings.init) {
		plugin.settings.init = true;
		for (const filter of Object.keys(plugin.userFilters)) {
			plugin.settings[`${filter}-enabled`] = false;
		}
		await meta.settings.set(plugin.id, plugin.settings, true);
	}
	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/restrict-usernames', [], (req, res) => {
		res.render('admin/plugins/restrict-usernames', { rules: plugin.userFilters });
	});
};

plugin.userFilters = {
	duplicate: {
		type: 'boolean',
		name: "Don't allow duplicate usernames",
		description: 'If enabled, registering with a taken username (different case or special characters, but same slug) will throw an error instead of adding a number',
		function: async (username) => {
			const exists = await meta.userOrGroupExists(username);
			if (exists) {
				throw new Error('[[error:username-taken]]');
			}
		},
	},
	onlyAlphabetic: {
		type: 'boolean',
		name: "Don't allow usernames without any letters",
		description: 'If enabled, registering with a username that contains no letters (eg. just numbers) will be rejected. Note that this is using Unicode Alphabetic property, so it may allow more characters than you expect.',
		function: (username) => {
			if (!/\p{Alphabetic}/ui.test(username)) {
				throw new Error('[[error:invalid-username]]');
			}
		},
	},
	onlyAlphaNumeric: {
		type: 'boolean',
		name: 'Only allow alphanumeric characters (+spaces) in usernames',
		description: 'If enabled, registering with a username that contains non-alphanumeric characters (special characters, emojis, weird whitespace) will be rejected. Note that this uses Unicode definition of alphanumerc which may contain more symbols that you expect.',
		function: (username) => {
			if (!/^(\p{Alphabetic}|\p{Number}| )+$/ui.test(username)) {
				throw new Error('[[error:invalid-username]]');
			}
		},
	},
};

plugin.saveSettings = async (data) => {
	if (data.plugin === plugin.id && !data.quiet && plugin.settings.init) {
		plugin.settings = await meta.settings.get(plugin.id);
	}
	return data;
};


plugin.checkRegistration = async (hookData) => {
	Promise.all(
		Object.entries(plugin.userFilters)
			.filter(filter => [true, 'on', 'enabled', 'true'].includes(plugin.settings[`${filter[0]}-enabled`]))
			.map(filter => filter[1].function(hookData.data.username))
	);
	return hookData;
};

plugin.addAdminNavigation = (header) => {
	header.plugins.push({
		route: '/plugins/restrict-usernames',
		icon: 'fa-tint',
		name: 'restrict-usernames',
	});

	return header;
};

module.exports = plugin;
