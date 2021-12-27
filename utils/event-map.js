const createEventMap = () => {
  const events = new Map();

  return {
    has: function (event) {
      return events.has(event.text);
    },
    set: function (event) {
      if (this.has(event)) return;

      events.set(event.text, event);
    },
    clear: function (event, delay = 120000) {
      if (!this.has(event)) return;

      setTimeout(() => {
        events.delete(event.text);
      }, delay);
    },
  };
};

module.exports = {
  createEventMap,
};
