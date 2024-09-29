'use strict';

const _ = require('lodash');

// const db = require('../database');
// const user = require('../user');
const categories = require('../categories');
// const messaging = require('../messaging');
const privileges = require('../privileges');
const meta = require('../meta');
const plugins = require('../plugins');

const controllersHelpers = require('../controllers/helpers');

const searchApi = module.exports;

// Main function for handling category searches
searchApi.categories = async (caller, data) => {
	// Placeholder arrays for category IDs (cids) and matched category IDs (matchedCids)
	let cids = [];
	let matchedCids = [];
	// Default privilege to check if not provided
	const privilege = data.privilege || 'topics:read';
	// Setting up watch states (e.g., watching, tracking, etc.)
	data.states = (data.states || ['watching', 'tracking', 'notwatching', 'ignoring']).map(
		state => categories.watchStates[state]
	);

	// Default parent category ID (cid)
	data.parentCid = parseInt(data.parentCid || 0, 10);

	// Check if there is a search query
	if (data.search) {
		// If there is a search query, find matched categories based on the search
		({ cids, matchedCids } = await findMatchedCids(caller.uid, data));
	} else {
		// If no search query, load all categories normally
		cids = await loadCids(caller.uid, data.parentCid);
	}

	// Get visible categories based on user's privileges and states
	const visibleCategories = await controllersHelpers.getVisibleCategories({
		cids, // Category IDs to check visibility
		uid: caller.uid, // User ID
		states: data.states, // Watch states (e.g., watching, tracking)
		privilege, // The privilege to check (default is 'topics:read')
		showLinks: data.showLinks,
		parentCid: data.parentCid,
	});
	// Handle selected categories from the UI if provided
	if (Array.isArray(data.selectedCids)) {
		data.selectedCids = data.selectedCids.map(cid => parseInt(cid, 10));
	}

	// Build the final category data array
	let categoriesData = categories.buildForSelectCategories(visibleCategories, ['disabledClass'], data.parentCid);
	categoriesData = categoriesData.slice(0, 200); // Limit to 200 categories

	// Mark selected and matched categories in the result
	categoriesData.forEach((category) => {
		category.selected = data.selectedCids ? data.selectedCids.includes(category.cid) : false;
		if (matchedCids.includes(category.cid)) {
			category.match = true; // Mark matched categories
		}
	});

	// Fire a plugin hook in case any other plugins want to modify the category data
	const result = await plugins.hooks.fire('filter:categories.categorySearch', {
		categories: categoriesData, // The category data
		...data, // Spread in any additional data passed
		uid: caller.uid, // The user ID
	});

	return { categories: result.categories }; // Return the final category result
};

// Function to find matching categories based on the search query
async function findMatchedCids(uid, data) {
	// Use the search function in the 'categories' module to search for categories
	const result = await categories.search({
		uid: uid, // User ID for permission checks
		query: data.search, // The search query entered by the user
		qs: data.query, // Additional query parameters
		paginate: false, // No pagination for now
	});

	// Extract matching category IDs
	let matchedCids = result.categories.map(c => c.cid);

	// If not all watch states are selected, filter by watch state
	const filterByWatchState = !Object.values(categories.watchStates)
		.every(state => data.states.includes(state));

	if (filterByWatchState) {
		// Get watch states for the matched categories and filter based on those
		const states = await categories.getWatchState(matchedCids, uid);
		matchedCids = matchedCids.filter((cid, index) => data.states.includes(states[index]));
	}

	// Get the parent and child category IDs for each matched category
	const rootCids = _.uniq(_.flatten(await Promise.all(matchedCids.map(categories.getParentCids))));
	const allChildCids = _.uniq(_.flatten(await Promise.all(matchedCids.map(categories.getChildrenCids))));

	// Return both the matched category IDs and the expanded list of categories
	return {
		cids: _.uniq(rootCids.concat(allChildCids).concat(matchedCids)), // Combined parent, child, and matched categories
		matchedCids: matchedCids, // Only the matched categories
	};
}

// Function to load category IDs if no search query is provided
async function loadCids(uid, parentCid) {
	let resultCids = [];

	// Recursive function to gather child categories
	async function getCidsRecursive(cids) {
		const categoryData = await categories.getCategoriesFields(cids, ['subCategoriesPerPage']);
		const cidToData = _.zipObject(cids, categoryData);

		await Promise.all(cids.map(async (cid) => {
			const allChildCids = await categories.getAllCidsFromSet(`cid:${cid}:children`);
			if (allChildCids.length) {
				const childCids = await privileges.categories.filterCids('find', allChildCids, uid);
				resultCids.push(...childCids.slice(0, cidToData[cid].subCategoriesPerPage));
				await getCidsRecursive(childCids);
			}
		}));
	}

	// Get the root categories for the parent category
	const allRootCids = await categories.getAllCidsFromSet(`cid:${parentCid}:children`);
	const rootCids = await privileges.categories.filterCids('find', allRootCids, uid);
	const pageCids = rootCids.slice(0, meta.config.categoriesPerPage);
	resultCids = pageCids;

	// Recursively get child categories
	await getCidsRecursive(pageCids);
	return resultCids; // Return the list of category IDs
}
