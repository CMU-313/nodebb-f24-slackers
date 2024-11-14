'use strict';

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	const TRANSLATOR_API = 'https://slackers-translator-d7bcacgqd5a2gsap.canadacentral-01.azurewebsites.net/';

	try {
		const response = await fetch(`${TRANSLATOR_API}/?content=${encodeURIComponent(postData.content)}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch translation: ${response.status} ${response.statusText}`);
		}

		// Attempt to parse response as JSON
		let data;
		try {
			data = await response.json();
		} catch (err) {
			throw new Error('Unexpected response format: Expected JSON but received non-JSON data');
		}

		// Check if the necessary fields are present in the data
		if (!data || typeof data.is_english !== 'boolean' || typeof data.translated_content !== 'string') {
			throw new Error('Incomplete data: Missing expected fields in response');
		}

		return [data.is_english, data.translated_content];
	} catch (error) {
		console.error('Translation API error:', error.message);
		return [null, 'Error in translation service'];
	}
};
