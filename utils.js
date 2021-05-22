const locale = require('date-fns/locale/ko');
const { format, utcToZonedTime } = require('date-fns-tz');
const getWeekOfMonth = require('date-fns/getWeekOfMonth');

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

module.exports = {
  convertToMarkdown,
  formatCurrentTime,
};
