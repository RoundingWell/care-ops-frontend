const faker = require('faker');
const moment = require('moment');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: `${ faker.hacker.verb() } ${ faker.hacker.adjective() } ${ faker.hacker.noun() }`,
      details: faker.lorem.sentences(),
      published: faker.random.boolean(),
      created_at: moment(faker.date.between(
        moment().utc().subtract(2, 'weeks').format(),
        moment().utc().format()
      )),
      updated_at: faker.date.between(
        moment().utc().subtract(1, 'week').format(),
        moment().utc().format()
      ),
    };
  },
};
