require('dotenv').config();

const { Octokit } = require('@octokit/core');
const { Base64 } = require('js-base64');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

const locale = require('date-fns/locale/ko');
const { format, utcToZonedTime } = require('date-fns-tz');
const getWeekOfMonth = require('date-fns/getWeekOfMonth');

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

slackEvents.on('app_mention', (event) => {
  const zonedTime = utcToZonedTime(new Date(), TIME_ZONE);
  const year = zonedTime.getFullYear();
  const month = zonedTime.getMonth() + 1;
  const weekOfMonth = getWeekOfMonth(zonedTime, {
    locale,
    weekStartsOn: 1,
  });
  const date = format(zonedTime, 'yyyy-MM-dd HH:mm', { locale });

  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text} / ${date} ${year}년_${month}월_${weekOfMonth}주차`);

  (async () => {
    try {
      const { user } = await slackClient.users.info({ user: event.user });
      const committer = {
        name: user.profile.real_name,
        email: user.profile.email,
      };

      const path = `${year}년_${month}월/${weekOfMonth}주차_스터디.md`;
      const userMessage = event.text.replace('<@U0106J68PHP>', '').trim();
      let file = null;

      try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: 'jy7123943',
          repo: 'plan',
          path,
        });

        file = data;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      let uploadedLink = null;
      if (file === null) {
        // file is not defined

        const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          accept: 'application/vnd.github.v3+json',
          owner: 'jy7123943',
          repo: 'plan',
          path,
          message: `Add study - ${date}`,
          content: Base64.encode(userMessage),
          committer,
        });

        uploadedLink = data.content.html_url;
      } else {
        // file is already defined

        const originalContent = Base64.decode(file.content);

        const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          accept: 'application/vnd.github.v3+json',
          owner: 'jy7123943',
          repo: 'plan',
          path,
          message: `Add study - ${date}`,
          content: Base64.encode(originalContent + userMessage),
          sha: file.sha,
          committer,
        });

        uploadedLink = data.content.html_url;
      }

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

slackEvents.start(port).then(() => {
  console.log(`Server listening on port ${port}`);
});
