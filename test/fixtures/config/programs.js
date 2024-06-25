import faker from '@roundingwellos/faker';
import dayjs from 'dayjs';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: `${ faker.hacker.verb() } ${ faker.hacker.adjective() } ${ faker.hacker.noun() }`,
    details: faker.lorem.sentences(),
    published_at: faker.random.arrayElement([faker.date.between(
      dayjs().subtract(2, 'weeks').format(),
      dayjs().format(),
    ), null]),
    archived_at: faker.random.arrayElement([faker.date.between(
      dayjs().subtract(2, 'weeks').format(),
      dayjs().format(),
    ), null]),
    created_at: faker.date.between(
      dayjs().subtract(2, 'weeks').format(),
      dayjs().format(),
    ),
    updated_at: faker.date.between(
      dayjs().subtract(1, 'week').format(),
      dayjs().format(),
    ),
  };
};
