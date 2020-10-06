const faker = require('faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: `${ faker.hacker.verb() } ${ faker.hacker.adjective() } ${ faker.hacker.noun() }`,
      details: faker.lorem.sentences(),
      published: faker.random.boolean(),
      created_at: faker.date.between(
        dayjs().subtract(2, 'weeks').format(),
        dayjs().format()
      ),
      updated_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format()
      ),
    };
  },
};
