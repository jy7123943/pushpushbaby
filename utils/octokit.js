const { Octokit } = require('@octokit/core');
const { GITHUB_ACCESS_TOKEN } = process.env;

const octokit = new Octokit({
  auth: GITHUB_ACCESS_TOKEN,
  baseUrl: 'https://api.github.com',
});

const getGitFile = async (gitConfig) => {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', gitConfig);

    return data;
  } catch (error) {
    if (error.status !== 404) throw error;

    return null;
  }
};

const createOrUpdateGitFile = async (gitConfig) => {
  const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', gitConfig);

  return data;
};

module.exports = {
  getGitFile,
  createOrUpdateGitFile,
};
