'use strict';

const plugins = require('../plugins');

module.exports = function (Posts) {
	Posts.verify = async function (pid, uid) {
		return await toggleVerify('verify', pid, uid);
	};

	Posts.unverify = async function (pid, uid) {
		return await toggleVerify('unverify', pid, uid);
	};

	async function toggleVerify(type, pid, uid) {
		const isVerifying = type === 'verify';
		await plugins.hooks.fire(`filter:post.${type}`, { pid: pid, uid: uid });

		await Posts.setPostFields(pid, {
			verify: isVerifying ? 1 : 0,
			verifyUid: isVerifying ? uid : 0,
		});

		const postData = await Posts.getPostFields(pid, ['pid', 'tid', 'uid', 'content', 'timestamp']);

		return postData;
	}
};
