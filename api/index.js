const { Base64 } = require('js-base64');
const {
  convertToMarkdown,
  getFilePathAndCommitMessage,
} = require('../utils');
const { createOrUpdateGitFile, getGitFile } = require('../utils/octokit');

const createOrUpdateStudyMarkdown = async (slackClient, {
  userId,
  userMessage,
  uploadType,
}) => {
  const { user } = await slackClient.users.info({ user: userId });

  const { path, message } = getFilePathAndCommitMessage(uploadType);

  const gitConfig = {
    path,
    owner: 'fepocha',
    repo: 'study',
  };

  const file = await getGitFile(gitConfig);

  const originalContent = file ? Base64.decode(file.content) : '';

  const result = await createOrUpdateGitFile({
    ...gitConfig,
    message,
    accept: 'application/vnd.github.v3+json',
    content: Base64.encode(originalContent + convertToMarkdown(user.profile.real_name, userMessage)),
    sha: file ? file.sha : undefined,
    committer: {
      name: user.profile.real_name,
      email: user.profile.email,
    },
  });

  return result;
};

module.exports = {
  createOrUpdateStudyMarkdown,
};
