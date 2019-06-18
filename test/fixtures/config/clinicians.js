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
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      credentials,
    };
  },
};
