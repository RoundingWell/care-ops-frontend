const faker = require('faker');
const moment = require('moment');

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
