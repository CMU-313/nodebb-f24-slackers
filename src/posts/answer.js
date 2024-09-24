'use strict';

const db = require('../database');
const plugins = require('../plugins');

module.exports = function (Posts) {
	Posts.answer = async function (pid, uid) {
		return await toggleAnswered('answer', pid, uid);
	};

    Posts.unanswer = async function (pid, uid) {
        return await toggleAnswered('unanswer', pid, uid);
    };

	async function toggleAnswered(type, pid, uid) {
        const isAnswering = type === 'answer';
        await plugins.hooks.fire(`filter:post.${type}`, { pid: pid, uid: uid });

        await Posts.setPostFields(pid, {
			answered: isAnswering ? 1 : 0,
			answererUid: isAnswering ? uid : 0,
		});

		const postData = await Posts.getPostFields(pid, ['pid', 'tid', 'uid', 'content', 'timestamp']);

		return postData;
	};
}
