const faker = require('faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      days_until_due: faker.random.number({
        min: 0,
        max: 99,
      }),
      status: faker.random.arrayElement(['draft', 'published']),
      sequence: faker.random.number(100),
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
