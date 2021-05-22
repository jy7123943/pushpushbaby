const { UPLOAD_TYPE_REGEXP } = require('../constants');

exports.getValidTextAndType = (text) => {
  const mentionErasedText = text.replace('<@U0106J68PHP>', '').trim();

  const [_, uploadType, message] = mentionErasedText.split(UPLOAD_TYPE_REGEXP);

  const isValidUploadType = UPLOAD_TYPE_REGEXP.test(uploadType);

  if (!isValidUploadType) {
    throw new Error('weekly/plan/meeting 중 하나의 명령어를 사용해주세요!');
  }

  const userMessage = message.trim();

  if (!userMessage) {
    throw new Error('내용을 입력해주세요!');
  }

  return {
    uploadType,
    userMessage,
  };
};
