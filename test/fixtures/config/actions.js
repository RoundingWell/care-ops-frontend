import faker from '@roundingwellos/faker';
import dayjs from 'dayjs';
import _ from 'underscore';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormatPlugin);

const timeFormat = 'HH:mm:ss';

const start = dayjs('07:00:00', timeFormat);

const times = _.times(96, function(n) {
  return { time: start.add(15 * n, 'minutes').format(timeFormat) };
});

times.unshift({ time: null });

export default () => {
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
};
