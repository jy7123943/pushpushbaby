require('dotenv').config();

const express = require('express');

const { Base64 } = require('js-base64');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

const { convertToMarkdown, formatCurrentTime } = require('./utils');
const { createOrUpdateGitFile, getGitFile } = require('./octokit');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const {
  SLACK_ACCESS_TOKEN,
  PORT,
} = process.env;

const slackClient = new WebClient(SLACK_ACCESS_TOKEN);

app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('app_mention', (event) => {
  const userMessage = event.text.replace('<@U0106J68PHP>', '').trim();
  const {
    year,
    month,
    weekOfMonth,
    dateString,
  } = formatCurrentTime();

  (async () => {
    try {
      const { user } = await slackClient.users.info({ user: event.user });
      const committer = {
        name: user.profile.real_name,
        email: user.profile.email,
      };

      const gitConfig = {
        path: `${year}년_${month}월/${weekOfMonth}주차_스터디.md`,
        owner: 'fepocha',
        repo: 'study',
      }

      const file = await getGitFile(gitConfig);

      const originalContent = file ? Base64.decode(file.content) : '';

      const result = await createOrUpdateGitFile({
        ...gitConfig,
        accept: 'application/vnd.github.v3+json',
        message: `Add study - ${dateString}`,
        content: Base64.encode(originalContent + convertToMarkdown(user.profile.real_name, userMessage)),
        sha: file ? file.sha : undefined,
        committer,
      })

      const uploadedLink = result.content.html_url;

      await slackClient.chat.postMessage({
        channel: event.channel,
        text: `<@${event.user}> 성공적으로 업데이트되었습니다. <${uploadedLink}|Link>`,
      });
    } catch (error) {
      await slackClient.chat.postMessage({
        channel: event.channel,
        text: `<@${event.user}> 업데이트에 실패했습니다: ${error.message}`,
      });
    }
  })();
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
