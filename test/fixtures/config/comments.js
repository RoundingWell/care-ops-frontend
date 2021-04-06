const faker = require('faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      message: faker.lorem.sentences(),
      edited_at: faker.random.arrayElement([faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format()
      ), null]),
      created_at: faker.date.between(
        dayjs().subtract(2, 'week').format(),
        dayjs().subtract(1, 'week').format(),
      ),
      updated_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format()
      ),
    };
  },
};
