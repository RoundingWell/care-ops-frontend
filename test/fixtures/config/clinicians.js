const faker = require('faker');
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
      access: faker.random.arrayElement(['employee', 'manager', 'admin', 'account_manager']),
      credentials,
    };
  },
};
