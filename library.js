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
	const { router } = params;
	({ diceCoefficient } = await import('dice-coefficient'));
	({ bigram } = await import('n-gram'));
	plugin.settings = await meta.settings.get(plugin.id);
	if (!plugin.settings.init) {
		plugin.settings.init = true;
		for (const filter of Object.keys(plugin.userFilters)) {
			plugin.settings[`${filter}-enabled`] = false;
		}
		plugin.settings['similarity-value'] = 85;
		await meta.settings.set(plugin.id, plugin.settings, true);
	}
	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/restrict-usernames', [], (req, res) => {
		res.render('admin/plugins/restrict-usernames', { rules: plugin.userFilters });
	});
};

plugin.userFilters = {
	duplicate: {
		type: 'boolean',
		name: '[[restrict-usernames:filter.duplicate.name]]',
		description: '[[restrict-usernames:filter.duplicate.description]]',
		function: async (username) => {
			const exists = await meta.userOrGroupExists(username);
			if (exists) {
				throw new Error('[[restrict-usernames:error.username-taken]]');
			}
		},
	},
	onlyAlphabetic: {
		type: 'boolean',
		name: '[[restrict-usernames:filter.onlyAlphabetic.name]]',
		description: '[[restrict-usernames:filter.onlyAlphabetic.description]]',
		function: (username) => {
			if (!/\p{Alphabetic}/ui.test(username)) {
				throw new Error('[[restrict-usernames:error.no-letters]]');
			}
		},
	},
	onlyAlphaNumeric: {
		type: 'boolean',
		name: '[[restrict-usernames:filter.onlyAlphaNumeric.name]]',
		description: '[[restrict-usernames:filter.onlyAlphaNumeric.description]]',
		function: (username) => {
			if (!/^(\p{Alphabetic}|\p{Number}| )+$/ui.test(username)) {
				throw new Error('[[restrict-usernames:error.special-characters]]');
			}
		},
	},
	similarity: {
		type: 'number',
		name: '[[restrict-usernames:filter.similarity.name]]',
		min: 0,
		max: 100,
		placeholder: 85,
		description: '[[restrict-usernames:filter.similarity.description]]',
		function: async (username) => {
			// just precompute the bigrams for the current username to avoid redoing the work
			const usernameBigrams = bigram(username);
			await batch.processSortedSet('username:uid', (checkedUsernames) => {
				if (!checkedUsernames.length) {
					checkedUsernames = [checkedUsernames];
				}
				for (const checkedUsername of checkedUsernames) {
					const similarity = diceCoefficient(usernameBigrams, checkedUsername);
					if (similarity >= parseInt(plugin.settings['similarity-value'] ?? plugin.userFilters.similarity.placeholder, 10) / 100) {
						throw new Error(`[[restrict-usernames:error.username-too-similar, ${checkedUsername}]]`);
					}
				}
			}, {});
		},
	},
	regex: {
		type: 'rules',
		name: '[[restrict-usernames:filter.regex.name]]',
		description: '[[restrict-usernames:filter.regex.description]]',
		function: (username) => {
			const rules = plugin.settings['regex-rules'];
			if (!rules) {
				return;
			}
			for (const { rule, insensitive } of rules) {
				if (new RegExp(rule, insensitive === 'on' ? 'iu' : 'u').test(username)) {
					throw new Error('[[restrict-usernames:error.username-blacklisted]]');
				}
			}
		},
	},
};

plugin.saveSettings = async (data) => {
	if (data.plugin === plugin.id && !data.quiet && plugin.settings.init) {
		plugin.settings = await meta.settings.get(plugin.id);
		console.log(plugin.settings);
	}
	return data;
};


plugin.checkRegistration = async (hookData) => {
	await Promise.all(
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
