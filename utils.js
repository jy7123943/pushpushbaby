const convertToMarkdown = (userName, message) => (
  `<h2>${userName}</h2>` + toHTML(message)
);

module.exports = {
  convertToMarkdown,
};
