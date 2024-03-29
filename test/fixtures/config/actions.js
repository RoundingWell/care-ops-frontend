const faker = require('@roundingwellos/faker');
const dayjs = require('dayjs');
const _ = require('underscore');
const customParseFormatPlugin = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormatPlugin);

const timeFormat = 'HH:mm:ss';

const start = dayjs('07:00:00', timeFormat);

const times = _.times(96, function(n) {
  return { time: start.add(15 * n, 'minutes').format(timeFormat) };
});

times.unshift({ time: null });

module.exports = {
  generate() {
    const created = faker.date.between(
      dayjs().subtract(1, 'week').format(),
      dayjs().format(),
    );

    const due = dayjs(faker.date.between(
      dayjs().subtract(1, 'week').format(),
      dayjs().add(1, 'week').format(),
    ));

    return {
      id: faker.datatype.uuid(),
      name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
      details: faker.lorem.sentences(),
      due_date: due.format('YYYY-MM-DD'),
      due_time: (faker.random.arrayElement(times)).time,
      duration: faker.datatype.number({
        min: 0,
        max: 99,
      }),
      sequence: faker.datatype.number(100),
      created_at: created,
      outreach: 'disabled',
      sharing: 'disabled',
      updated_at: faker.date.between(
        created,
        dayjs().format(),
      ),
    };
  },
};
