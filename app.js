require('dotenv').config();

const express = require('express');

const { Octokit } = require('@octokit/core');
const { Base64 } = require('js-base64');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

const locale = require('date-fns/locale/ko');
const { format, utcToZonedTime } = require('date-fns-tz');
const getWeekOfMonth = require('date-fns/getWeekOfMonth');
const { convertToMarkdown } = require('./utils');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const TIME_ZONE = 'Asia/Seoul';

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

app.use('/slack/events', slackEvents.expressMiddleware())

slackEvents.on('app_mention', (event) => {
  const userMessage = event.text.replace('<@U0106J68PHP>', '').trim();
  const zonedTime = utcToZonedTime(new Date(), TIME_ZONE);
  const year = zonedTime.getFullYear();
  const month = zonedTime.getMonth() + 1;
  const weekOfMonth = getWeekOfMonth(zonedTime, {
    locale,
    weekStartsOn: 1,
  });
  const date = format(zonedTime, 'yyyy-MM-dd HH:mm', { locale });

  (async () => {
    try {
      const { user } = await slackClient.users.info({ user: event.user });
      const committer = {
        name: user.profile.real_name,
        email: user.profile.email,
      };

      const config = {
        path: `${year}년_${month}월/${weekOfMonth}주차_스터디.md`,
        owner: 'fepocha',
        repo: 'study',
      }

      let file;

      try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', config);

        file = data;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      const originalContent = file ? Base64.decode(file.content) : '';

      const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...config,
        accept: 'application/vnd.github.v3+json',
        message: `Add study - ${date}`,
        content: Base64.encode(originalContent + convertToMarkdown(user.profile.real_name, userMessage)),
        sha: file ? file.sha : undefined,
        committer,
      });

      file = undefined;

      const uploadedLink = data.content.html_url;

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
  console.log(`Express server listening on port ${port}`)
})
