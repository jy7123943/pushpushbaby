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
    mapPromise: function (promiseCallback) {
      const eventPromises = [];

      events.forEach((event, key) => {
        eventPromises.push(promiseCallback(event));
        events.delete(key);
      });

      return eventPromises;
    }
  };
};

module.exports = {
  createEventQueue,
};
