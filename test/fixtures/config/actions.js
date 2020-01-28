const faker = require('faker');
const moment = require('moment');
const _ = require('underscore');

const start = moment({ hour: 6, minute: 45, second: 0 });

const times = _.times(96, function() {
  return { time: start.add(15, 'minutes').format('HH:mm:ss') };
});

times.unshift({ time: null });

module.exports = {
  generate() {
    const created = faker.date.between(
      moment().subtract(1, 'week').format(),
      moment().format()
    );

    const due = moment(faker.date.between(
      moment().subtract(1, 'week').format(),
      moment().add(1, 'week').format()
    ));

    return {
      id: faker.random.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      due_date: due.format('YYYY-MM-DD'),
      due_time: (faker.random.arrayElement(times)).time,
      duration: faker.random.number({
        min: 0,
        max: 99,
      }),
      created_at: created,
      updated_at: faker.date.between(
        created,
        moment().format()
      ),
    };
  },
};
