const faker = require('faker');
const moment = require('moment');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      message: faker.lorem.sentences(),
      edited_at: faker.random.arrayElement([faker.date.between(
        moment().subtract(1, 'week').format(),
        moment().format()
      ), null]),
      created_at: faker.date.between(
        moment().subtract(2, 'week').format(),
        moment().subtract(1, 'week').format(),
      ),
      updated_at: faker.date.between(
        moment().subtract(1, 'week').format(),
        moment().format()
      ),
    };
  },
};
