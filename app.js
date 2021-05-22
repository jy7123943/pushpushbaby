require('dotenv').config();

const express = require('express');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const { postWeeklyStudyReport } = require('./api/weekly');

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
      user_id: userId,
      text,
    } = req.body;

    const { content: { html_url }} = await postWeeklyStudyReport(slackClient, {
      userId,
      userMessage: text.trim(),
    });

    res.json({
      response_type: 'in_channel',
      text: `<@${userId}> 업데이트에 성공했어요! :baby: :point_right: <${html_url}|Link>`
    });
  } catch (error) {
    res.json({
      response_type: 'in_channel',
      text: `<@${userId}> 업데이트에 실패했어요 :angel: ${error.message}`
    });
  }
});

slackEvents.on('app_mention', async (event) => {
  try {
    const userMessage = event.text.replace('<@U0106J68PHP>', '').trim();

    const { content: { html_url }} = await postWeeklyStudyReport(slackClient, {
      userId: event.user,
      userMessage,
    })

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 성공했어요! :baby: :point_right: <${html_url}|Link>`,
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
