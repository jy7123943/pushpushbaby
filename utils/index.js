const locale = require('date-fns/locale/ko');
const { format, utcToZonedTime } = require('date-fns-tz');
const getWeekOfMonth = require('date-fns/getWeekOfMonth');
const { UPLOAD_TYPE, UPLOAD_TYPE_REGEXP } = require('../constants');

const { toHTML } = require('slack-markdown');

const convertToStudyMarkdown = (userName, message) => (
  `<h2>${userName}</h2>` + toHTML(message)
);
const convertToInitialLinkMarkdown = (message) => {
  const { year, month } = formatCurrentTime();
  return (
    `<h1>${year}-${month} Links</h1>`
    + `<ul><li>${toHTML(message)}</li></ul>`
  );
};
const convertToLinkMarkdown = (originalContent, message) => (
  originalContent.replace('</ul>', '')
  + `<li>${toHTML(message)}</li></ul>`
);
const convertToInitialTilMarkdown = (message) => {
  const { year, month, date } = formatCurrentTime();
  return (
    `<h1>${year}-${month}</h1>`
    + `<h3>Day ${date}</h3>`
    + `<p>${toHTML(message)}</p>`
  );
};
const convertToTilMarkdown = (originalContent, message) => {
  const { date } = formatCurrentTime();
  return (
    originalContent
    + `<hr/><h3>Day ${date}</h3>`
    + `<p>${toHTML(message)}</p>`
  );
};

const TIME_ZONE = 'Asia/Seoul';

const formatCurrentTime = () => {
  const zonedTime = utcToZonedTime(new Date(), TIME_ZONE);
  const year = zonedTime.getFullYear();
  const month = zonedTime.getMonth() + 1;
  const date = zonedTime.getDate();
  const weekOfMonth = getWeekOfMonth(zonedTime, {
    locale,
    weekStartsOn: 1,
  });
  const dateString = format(zonedTime, 'yy-MM-dd HH:mm', { locale });

  return {
    year,
    month,
    date,
    weekOfMonth,
    dateString,
  };
};

const getFilePathAndCommitMessage = (uploadType) => {
  const {
    year,
    month,
    weekOfMonth,
    dateString,
  } = formatCurrentTime();

  switch (uploadType) {
    case UPLOAD_TYPE.WEEKLY:
      return {
        path: `스터디_리포트/${year}년/${month}월/${weekOfMonth}주차_스터디.md`,
        message: `Upload study report - ${dateString}`,
      };
    case UPLOAD_TYPE.PLAN:
      return {
        path: `스터디_계획/${year}년_${month}월_${weekOfMonth}주차_스터디_계획.md`,
        message: `Upload study plan - ${dateString}`,
      };
    case UPLOAD_TYPE.MEETING:
      return {
        path: `스터디_회고/${year}년_${month}월_${weekOfMonth}주차_스터디_회고.md`,
        message: `Upload study meeting log - ${dateString}`,
      };
    case UPLOAD_TYPE.TRANSLATE:
      return {
        path: `번역_스터디_리포트/${year}년/${month}월/${weekOfMonth}주차_번역_스터디.md`,
        message: `Upload translation group study report - ${dateString}`,
      };
    case UPLOAD_TYPE.LINKS:
      return {
        path: `${year}년/${month}월.md`,
        message: `Upload link - ${dateString}`,
      };
    case UPLOAD_TYPE.TIL:
      return {
        path: `${year}년/${month}월.md`,
        message: `Upload til - ${dateString}`,
      };
    default:
      throw new Error(`${JSON.stringify(uploadType)} is not a valid type`);
  }
};

const parseAppMentionText = (text) => {
  const mentionErasedText = text.replace('<@U0106J68PHP>', '').trim();

  const messageIndex = mentionErasedText.search(/\s|\n/);
  const uploadType = mentionErasedText.slice(0, messageIndex).trim();
  const userMessage = mentionErasedText.slice(messageIndex + 1).trim();

  const isValidUploadType = UPLOAD_TYPE_REGEXP.test(uploadType);

  if (!isValidUploadType) {
    throw new Error('[weekly/plan/meeting/translate/links 중 하나의 명령어+공백(또는 줄바꿈)+메시지] 형식으로 입력해주세요!');
  }

  if (!userMessage) {
    throw new Error('내용을 입력해주세요!');
  }

  return {
    uploadType,
    userMessage,
  };
};

module.exports = {
  convertToStudyMarkdown,
  convertToInitialLinkMarkdown,
  convertToLinkMarkdown,
  convertToInitialTilMarkdown,
  convertToTilMarkdown,
  formatCurrentTime,
  getFilePathAndCommitMessage,
  parseAppMentionText,
};
