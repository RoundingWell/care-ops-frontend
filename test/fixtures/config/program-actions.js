const faker = require('@roundingwellos/faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      days_until_due: faker.datatype.number({
        min: 0,
        max: 99,
      }),
      outreach: 'disabled',
      status: faker.random.arrayElement(['draft', 'published']),
      sequence: faker.datatype.number(100),
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
