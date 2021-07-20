const fs = require('fs');

const errorMessages = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/messages.json`)
);

class Message {
  constructor(id) {
    const message = errorMessages.find((el) => el.id === id);
    this.descrshort = message.descrshort;
    this.descrlong = message.descrlong;
  }

  toString() {
    return `${this.descrshort}\n\n${this.descrlong}`;
  }
}

module.exports = Message;
