const dayjs = require('dayjs');
const faker = require('@roundingwellos/faker');

module.exports = {
  generate() {
    const created = faker.date.between(
      dayjs().subtract(1, 'week').format(),
      dayjs().format(),
    );

    return {
      created_at: created,
      status: faker.random.arrayElement(['active', 'inactive', 'archived']),
      updated_at: faker.date.between(
        created,
        dayjs().format(),
      ),
    };
  },
};
