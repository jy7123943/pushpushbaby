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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/slack/events', slackEvents.expressMiddleware());
app.use('/slack/help', (req, res) => {
  res.json({
    text: '안녕하세요 :wave: 필요할 때 언제든지 `/pushpushbaby` 커멘드로 저를 불러주세요. :baby:\n'
      + ':one: `@pushpushbaby weekly{공백 1개 or 줄바꿈}{스터디 내용}`\n'
      + '> 스터디 주간 리포트를 업로드합니다. \n'
      + ':two: `@pushpushbaby plan{공백 1개 or 줄바꿈}{스터디 내용}`\n'
      + '> 스터디 계획을 업로드합니다. \n'
      + ':three: `@pushpushbaby meeting{공백 1개 or 줄바꿈}{스터디 내용}`\n'
      + '> 스터디 미팅 로그를 업로드합니다. \n'
      + ':four: `@pushpushbaby translate{공백 1개 or 줄바꿈}{스터디 내용}`\n'
      + '> 영어 번역 스터디 주간 리포트를 업로드합니다. \n',
  });
});

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
      text: `<@${event.user}> 에러가 발생했어요! :baby_chick: :point_right: ${error.message}`,
    });
  }
};

slackEvents.on('app_mention', async (event) => {
  if (EventQueue.has(event)) return;

  EventQueue.set(event);

  await slackClient.chat.postEphemeral({
    channel: event.channel,
    user: event.user,
    text: '잠시만 기다려주세요!',
  });

  setTimeout(async () => {
    await Promise.all(EventQueue.createPromises(handleAppMention));
  }, 1000);
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
