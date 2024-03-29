const { Base64 } = require('js-base64');
const { UPLOAD_TYPE } = require('../constants');
const {
  convertToStudyMarkdown,
  convertToInitialLinkMarkdown,
  convertToInitialTilMarkdown,
  convertToTilMarkdown,
  convertToLinkMarkdown,
  getFilePathAndCommitMessage,
} = require('../utils');
const { createOrUpdateGitFile, getGitFile } = require('../utils/octokit');

const getStudyContent = ({ file, userName, userMessage }) => {
  const originalContent = file ? Base64.decode(file.content) : '';

  return Base64.encode(originalContent + convertToStudyMarkdown(userName, userMessage));
};

const getLinkContent = ({ file, userMessage }) => {
  const content = file
    ? convertToLinkMarkdown(Base64.decode(file.content), userMessage)
    : convertToInitialLinkMarkdown(userMessage);

  return Base64.encode(content);
};

const getTilContent = ({ file, userMessage }) => {
  const content = file
    ? convertToTilMarkdown(Base64.decode(file.content), userMessage)
    : convertToInitialTilMarkdown(userMessage);

  return Base64.encode(content);
};

const createOrUpdateMarkdown = async (slackClient, {
  userId,
  userMessage,
  uploadType,
}) => {
  const isLinkType = uploadType === UPLOAD_TYPE.LINKS;
  const isTilType = uploadType === UPLOAD_TYPE.TIL;
  const { user } = await slackClient.users.info({ user: userId });

  const { path, message } = getFilePathAndCommitMessage(uploadType);
  const gitConfig = isTilType ? {
    path,
    owner: 'jy7123943',
    repo: 'til',
  } : {
    path,
    owner: 'fepocha',
    repo: isLinkType ? 'links' : 'study',
  };

  const file = await getGitFile(gitConfig);

  const content = isTilType
    ? getTilContent({ file, userMessage })
    : isLinkType
      ? getLinkContent({ file, userMessage })
      : getStudyContent({ file, userName: user.profile.real_name, userMessage })

  const result = await createOrUpdateGitFile({
    ...gitConfig,
    message,
    accept: 'application/vnd.github.v3+json',
    content,
    sha: file ? file.sha : undefined,
    committer: {
      name: isTilType ? 'jy7123943' : user.profile.real_name,
      email: isTilType ? 'jy7123943@gmail.com' : user.profile.email,
    },
  });

  return result;
};

module.exports = {
  createOrUpdateMarkdown,
};
