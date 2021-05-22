require('dotenv').config();

const express = require('express');
const { Base64 } = require('js-base64');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const { convertToMarkdown, formatCurrentTime } = require('./utils');
const { createOrUpdateGitFile, getGitFile } = require('./utils/octokit');

const {
  SLACK_ACCESS_TOKEN,
  SLACK_SIGNING_SECRET,
  PORT,
} = process.env;

const app = express();
const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET);

app.use('/slack/events', slackEvents.expressMiddleware());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const slackClient = new WebClient(SLACK_ACCESS_TOKEN);

app.post('/weekly', async (req, res) => {
  try {
    const {
      user_id,
      text,
    } = req.body;

    res.json({
      response_type: 'in_channel',
      text: `<@${user_id}> 업데이트에 성공했어요! :baby: :point_right:`
    });
  } catch (error) {
    res.json({
      response_type: 'in_channel',
      text: `<@${user_id}> 업데이트에 실패했어요 :angel: ${error.message}`
    });
  }
});

slackEvents.on('app_mention', async (event) => {
  try {
    const userMessage = event.text.replace('<@U0106J68PHP>', '').trim();
    const {
      year,
      month,
      weekOfMonth,
      dateString,
    } = formatCurrentTime();

    const { user } = await slackClient.users.info({ user: event.user });

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
      message: `Add study - ${dateString}`,
      content: Base64.encode(originalContent + convertToMarkdown(user.profile.real_name, userMessage)),
      sha: file ? file.sha : undefined,
      committer: {
        name: user.profile.real_name,
        email: user.profile.email,
      },
    });

    const uploadedLink = result.content.html_url;

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 성공했어요! :baby: :point_right: <${uploadedLink}|Link>`,
    });
  } catch (error) {
    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 실패했어요 :angel: ${error.message}`,
    });
  }
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
