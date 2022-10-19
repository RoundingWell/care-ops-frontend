const faker = require('@roundingwellos/faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      enabled: true,
      last_active_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format(),
      ),

    };
  },
};
