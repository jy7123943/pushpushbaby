const locale = require('date-fns/locale/ko');
const { format, utcToZonedTime } = require('date-fns-tz');
const getWeekOfMonth = require('date-fns/getWeekOfMonth');
const { UPLOAD_TYPE } = require('../constants');

const { toHTML } = require('slack-markdown');

const convertToMarkdown = (userName, message) => (
  `<h2>${userName}</h2>` + toHTML(message)
);

const TIME_ZONE = 'Asia/Seoul';

const formatCurrentTime = () => {
  const zonedTime = utcToZonedTime(new Date(), TIME_ZONE);
  const year = zonedTime.getFullYear();
  const month = zonedTime.getMonth() + 1;
  const weekOfMonth = getWeekOfMonth(zonedTime, {
    locale,
    weekStartsOn: 1,
  });
  const dateString = format(zonedTime, 'yyyy-MM-dd HH:mm', { locale });

  return {
    year,
    month,
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
        path: `스터디_리포트/${year}년_${month}월/${weekOfMonth}주차_스터디.md`,
        message: `Upload study report - ${dateString}`,
      };
    case UPLOAD_TYPE.PLAN:
      return {
        path: `스터디_계획/${year}년_${month}월_${weekOfMonth}주차~4주_계획.md`,
        message: `Upload study plan - ${dateString}`,
      };
    case UPLOAD_TYPE.MEETING:
      return {
        path: `스터디_회고/${year}년_${month}월_${weekOfMonth}주차_스터디_회고.md`,
        message: `Upload study meeting - ${dateString}`,
      };
    default:
      throw new Error(`${JSON.stringify(uploadType)} is not a valid type`);
  }
};

module.exports = {
  convertToMarkdown,
  formatCurrentTime,
  getFilePathAndCommitMessage,
};
