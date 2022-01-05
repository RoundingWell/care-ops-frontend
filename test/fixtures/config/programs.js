const faker = require('@roundingwellos/faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: `${ faker.hacker.verb() } ${ faker.hacker.adjective() } ${ faker.hacker.noun() }`,
      details: faker.lorem.sentences(),
      published: faker.datatype.boolean(),
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
