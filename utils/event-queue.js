const createEventQueue = () => {
  const events = new Map();

  return {
    has: function (event) {
      return events.has(event.text);
    },
    set: function (event) {
      if (this.has(event)) return;

      events.set(event.text, event);
    },
    mapEvent: function (eventHandler) {
      const eventPromises = [];

      events.forEach((event, key) => {
        eventPromises.push(eventHandler(event));

        setTimeout(() => {
          events.delete(key);
        }, 60000);
      });

      return eventPromises;
    },
  };
};

module.exports = {
  createEventQueue,
};
