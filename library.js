'use strict';


const meta = require.main.require('./src/meta');
const batch = require.main.require('./src/batch');

const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = {};

let diceCoefficient;
let bigram;
plugin.id = 'restrict-usernames';
plugin.settings = {};
plugin.init = async (params) => {
	const { router /* , middleware , controllers */ } = params;
	({ diceCoefficient } = await import('dice-coefficient'));
	({ bigram } = await import('n-gram'));
	// Settings saved in the plugin settings can be retrieved via settings methods
	plugin.settings = await meta.settings.get(plugin.id);
	if (!plugin.settings.init) {
		plugin.settings.init = true;
		for (const filter of Object.keys(plugin.userFilters)) {
			plugin.settings[`${filter}-enabled`] = false;
		}
		plugin.settings['similarity-value'] = 95;
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
	similarity: {
		type: 'number',
		name: 'Maximum similarity to existing usernames',
		min: 0,
		max: 100,
		placeholder: 95,
		description: 'If enabled, registering with a username that is too similar to an existing username will be rejected. This is calculated using Sørensen-Dice coefficient of these two usernames. The value is the maximum similarity allowed, so 95 means that usernames with coeffient of 0.95 or more will be rejected. Warning: setting this too low will cause a lot of false positives.',
		function: async (username) => {
			// just precompute the bigrams for the current username to avoid redoing the work
			const usernameBigrams = bigram(username);
			await batch.processSortedSet('username:uid', (checkedUsernames) => {
				for (const checkedUsername of checkedUsernames) {
					const similarity = diceCoefficient(usernameBigrams, checkedUsername);
					if (similarity >= parseInt(plugin.settings['similarity-value'] ?? plugin.userFilters.similarity.placeholder, 10) / 100) {
						throw new Error(`[[error:username-too-similar, ${checkedUsername}]]`);
					}
				}
			});
		},
	},
	regex: {
		type: 'rules',
		name: 'Custom blacklist (words or regex)',
		description: 'If enabled, registering with a username that matches any of the rules will be rejected. Rules are matched using JavaScript regex, but for basic usage just inputting the word will match it as is. Just be weary of special characters like parentheses or periods, which need to be escaped by prepending them with \\.',
		function: (username) => {
			const rules = plugin.settings['regex-rules'];
			for (const { rule } of rules) {
				if (new RegExp(rule).test(username)) {
					throw new Error('[[error:username-blacklisted]]');
				}
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
			.map(filter => filter[1].function(hookData.userData ? hookData.userData.username : hookData.username))
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
