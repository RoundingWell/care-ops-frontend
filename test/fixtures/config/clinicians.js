const faker = require('faker');
const dayjs = require('dayjs');
const _ = require('underscore');

module.exports = {
  generate() {
    const credentials = [];

    _.times(_.random(1, 3), () => {
      credentials.push(faker.finance.currencyCode());
    });

    return {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      access: faker.random.arrayElement(['employee', 'manager']),
      credentials,
      last_active_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format(),
      ),

    };
  },
};
