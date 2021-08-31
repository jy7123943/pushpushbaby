require('dotenv').config();

const express = require('express');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const { postStudyMarkdown } = require('./api');
const { formatCurrentTime, parseAppMentionText } = require('./utils');
const { createEventMemo } = require('./utils/event-queue');

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
app.use('/slack/skip', (req, res) => {
  const { month, date } = formatCurrentTime();

  res.json({
    response_type: 'in_channel',
    text: `<@${req.body.user_id}>님이 ${month}월 ${date}일에 스터디 skip권을 사용합니다. :male_fairy:`,
  });
});

const slackClient = new WebClient(SLACK_ACCESS_TOKEN);
const EventMemo = createEventMemo();

const uploadToGithub = async (event) => {
  const {
    uploadType,
    userMessage,
  } = parseAppMentionText(event.text);

  const { content: { html_url }} = await postStudyMarkdown(slackClient, {
    userId: event.user,
    userMessage,
    uploadType,
  });

  return html_url;
};

slackEvents.on('app_mention', async (event) => {
  try {
    if (EventMemo.has(event)) return;

    await slackClient.chat.postEphemeral({
      channel: event.channel,
      user: event.user,
      text: '잠시만 기다려주세요!',
    });

    EventMemo.set(event);

    const pageUrl = await uploadToGithub(event);

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 업데이트에 성공했어요! :baby: :point_right: <${pageUrl}|Link>`,
    });

    EventMemo.clear(event);
  } catch (error) {
    await slackClient.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> 에러가 발생했어요! :baby_chick: :point_right: ${error.message}`,
    });
  }
});

slackEvents.on('error', console.error);

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
