const faker = require('faker');
const moment = require('moment');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      due_date: moment(faker.date.between(
        moment().subtract(1, 'week').format(),
        moment().add(1, 'week').format()
      )).format('YYYY-MM-DD'),
      duration: faker.random.number({
        min: 1,
        max: 1200,
      }),
      updated_at: faker.date.between(
        moment().subtract(1, 'week').format(),
        moment().add(1, 'week').format()
      ),
    };
  },
};
