const faker = require('@roundingwellos/faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      status: faker.random.arrayElement(['draft', 'published']),
      created_at: faker.date.between(
        dayjs().subtract(2, 'week').format(),
        dayjs().subtract(1, 'week').format(),
      ),
      updated_at: faker.date.between(
        dayjs().subtract(1, 'week').format(),
        dayjs().format(),
      ),
    };
  },
};
