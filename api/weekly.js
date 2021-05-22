const { Base64 } = require('js-base64');
const { convertToMarkdown, formatCurrentTime } = require('../utils');
const { createOrUpdateGitFile, getGitFile } = require('../utils/octokit');

const postWeeklyStudyReport = async ({
  userName,
  userEmail,
  userMessage,
}) => {
  const {
    year,
    month,
    weekOfMonth,
    dateString,
  } = formatCurrentTime();

  const gitConfig = {
    path: `${year}년_${month}월/${weekOfMonth}주차_스터디.md`,
    owner: 'fepocha',
    repo: 'study',
  };

  const file = await getGitFile(gitConfig);

  const originalContent = file ? Base64.decode(file.content) : '';

  const result = await createOrUpdateGitFile({
    ...gitConfig,
    accept: 'application/vnd.github.v3+json',
    message: `Add study report - ${dateString}`,
    content: Base64.encode(originalContent + convertToMarkdown(userName, userMessage)),
    sha: file ? file.sha : undefined,
    committer: {
      name: userName,
      email: userEmail,
    },
  });

  return result;
};

module.exports = {
  postWeeklyStudyReport,
}
