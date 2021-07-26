const createEventQueue = () => {
  const events = new Map();
  const deleteList = new Map();

  return {
    has: function (event) {
      return events.has(event.text) || deleteList.has(event.text);
    },
    set: function (event) {
      if (this.has(event)) return;

      events.set(event.text, event);
    },
    createPromises: function (eventHandler) {
      const eventPromises = [];

      events.forEach((event, key) => {
        eventPromises.push(eventHandler(event));
        deleteList.set(key, event);
        events.delete(key);

        setTimeout(() => {
          deleteList.delete(key);
        }, 120000);
      });

      return eventPromises;
    },
  };
};

module.exports = {
  createEventQueue,
};
