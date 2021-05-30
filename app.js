require('dotenv').config();

const express = require('express');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const { postStudyMarkdown } = require('./api');
const { parseAppMentionText } = require('./utils');
const { createEventQueue } = require('./utils/event-queue');

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
const EventQueue = createEventQueue();

const handleAppMention = async (event) => {
  try {
    const {
      uploadType,
      userMessage,
    } = parseAppMentionText(event.text);

    const { content: { html_url }} = await postStudyMarkdown(slackClient, {
      userId: event.user,
      userMessage,
      uploadType,
    })

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 성공했어요! :baby: :point_right: <${html_url}|Link>`,
    });
  } catch (error) {
    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 실패했어요 :baby_chick: :point_right: ${error.message}`,
    });
  }
};

slackEvents.on('app_mention', async (event) => {
  EventQueue.set(event);

  await slackClient.chat.postEphemeral({
    channel: event.channel,
    user: event.user,
    text: '잠시만 기다려주세요!',
  });

  setTimeout(async () => {
    await Promise.all(EventQueue.mapEvent(handleAppMention));
  }, 10000);
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
