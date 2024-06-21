import faker from '@roundingwellos/faker';
import dayjs from 'dayjs';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
    details: faker.lorem.sentences(),
    created_at: faker.date.between(
      dayjs().subtract(2, 'week').format(),
      dayjs().subtract(1, 'week').format(),
    ),
    updated_at: faker.date.between(
      dayjs().subtract(1, 'week').format(),
      dayjs().format(),
    ),
  };
};
