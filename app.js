require('dotenv').config();

const { Octokit } = require('@octokit/core');
const { Base64 } = require('js-base64');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

const {
  SLACK_ACCESS_TOKEN,
  GITHUB_ACCESS_TOKEN,
  PORT,
} = process.env;

const slackClient = new WebClient(SLACK_ACCESS_TOKEN);
const octokit = new Octokit({
  auth: GITHUB_ACCESS_TOKEN,
  baseUrl: 'https://api.github.com',
});

slackEvents.on('app_mention', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);


  (async () => {
    try {
      const { user } = await slackClient.users.info({
        user: event.user
      });
      console.log('🚀 ~ user.name:', user.name);
      console.log('🚀 ~ user.email:', user.profile.email);
      // const { data: file } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      //   owner: 'jy7123943',
      //   repo: 'plan',
      //   path: 'hello.md'
      // });
      // const originalContent = Base64.decode(file.content);

      // const userMessage = event.text.replace('<@U0106J68PHP> ', '');
      // const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      //   accept: 'application/vnd.github.v3+json',
      //   owner: 'jy7123943',
      //   repo: 'plan',
      //   path: 'hello/hello.md',
      //   message: `Add new file - ${new Date().toISOString()}`,
      //   content: Base64.encode(originalContent + userMessage),
      //   // sha: file.sha,
      //   committer: {
      //     name: 'helloworld712',
      //     email: 'juy.dev@gmail.com',
      //   }
      // });
      // console.log('🚀 ~ file: app.js ~ line 22 ~ data', data);
      // await slackClient.chat.postMessage({
      //   channel: event.channel,
      //   text: `Hello <@${event.user}>`,
      // });
    } catch (error) {
      console.log(error);
    }
  })();
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

slackEvents.start(port).then(() => {
  console.log(`Server listening on port ${port}`);
});
