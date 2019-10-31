const faker = require('faker');
const _ = require('underscore');

module.exports = {
  generate() {
    const credentials = [];

    _.times(_.random(1, 3), () => {
      credentials.push(faker.finance.currencyCode());
    });

    const first = faker.name.firstName();
    const last = faker.name.lastName();

    return {
      id: faker.random.uuid(),
      first_name: first,
      last_name: last,
      name: `${ first } ${ last }`,
      email: faker.internet.email(),
      access: faker.random.arrayElement(['employee', 'manager', 'admin', 'account_manager']),
      credentials,
    };
  },
};
