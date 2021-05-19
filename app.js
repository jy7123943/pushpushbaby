require('dotenv').config();

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;

const webClient = new WebClient(SLACK_ACCESS_TOKEN);

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

slackEvents.on('error', console.error);

const PORT = process.env.PORT || 3000;

slackEvents.start(PORT).then(() => {
  console.log(`Server listening on port ${PORT}`);
});
