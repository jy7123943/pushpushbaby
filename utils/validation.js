exports.validateText = (text) => {
  const userMessage = text.replace('<@U0106J68PHP>', '').trim();
  console.log('🚀 ~ file: validation.js ~ line 4 ~ userMessage', userMessage);

  if (!userMessage) {
    throw new Error('내용을 입력해주세요!');
  }
};
