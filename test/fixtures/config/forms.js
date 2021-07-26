const faker = require('faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: `${ faker.hacker.verb() } ${ faker.hacker.noun() }`,
      details: faker.lorem.sentences(),
      created_at: faker.date.between(
        dayjs().subtract(2, 'weeks').format(),
        dayjs().format()
      ),
      updated_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format()
      ),
      published_at: faker.random.arrayElement([faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format()
      ), null]),
    };
  },
};
