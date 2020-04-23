const faker = require('faker');
const moment = require('moment');
const _ = require('underscore');

module.exports = {
  generate() {
    const credentials = [];

    _.times(_.random(1, 3), () => {
      credentials.push(faker.finance.currencyCode());
    });

    return {
      id: faker.random.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      access: faker.random.arrayElement(['employee', 'manager']),
      credentials,
      last_active_at: faker.date.between(
        moment().subtract(1, 'week').format(),
        moment().format(),
      ),

    };
  },
};
