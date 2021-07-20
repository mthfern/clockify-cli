const fs = require('fs');
const axios = require('axios').default;

const { endpoint, resources } = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/apiConfig.json`)
);

axios.defaults.baseURL = endpoint;

class Request {
  constructor(resource, placeholders = []) {
    const { name, method, route } = resources.find(
      (el) => el.name === resource
    );
    this.name = name;
    this.method = method;
    this.route = this.replacePlaceholders(route, placeholders);
  }

  async execute(config = {}) {
    const { data = {}, params = {} } = config;
    try {
      const result = await axios({
        method: this.method,
        url: this.route,
        params: params,
        data: data,
      });

      this.data = result.data;

      return this.data;
    } catch (error) {
      const newError = new Error(
        `Error executing request...\n${error.message}`
      );
      newError.stack = error.stack;
      throw newError;
    }
  }

  replacePlaceholders(route, subs) {
    subs.forEach(function (item) {
      const { name, value } = item;
      route = route.replace(name, value);
    });
    return route;
  }
}

exports.reqDefaults = axios.defaults;
exports.Request = Request;
