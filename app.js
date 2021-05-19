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
  const date = format(zonedTime, 'yyyy-MM-dd', { locale });

  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text} / ${date} ${year}년_${month}월_${weekOfMonth}주차`);

  (async () => {
    try {
      const { user } = await slackClient.users.info({ user: event.user });
      console.log('🚀 ~ user.name:', user.name);
      console.log('🚀 ~ user.email:', user.profile.email);
      console.log('🚀 ~ user.real_name:', user.profile.real_name);

      let fileSha = null;

      try {
        const { data: file } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: 'jy7123943',
          repo: 'plan',
          path: `${year}년_${month}월/${weekOfMonth}주차_스터디.md`,
        });

        fileSha = file.sha;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }
      console.log('🚀 ~ file: app.js ~ line 51 ~ fileSha', fileSha);
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
