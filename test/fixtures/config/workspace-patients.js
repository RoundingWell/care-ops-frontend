import faker from '@roundingwellos/faker';
import dayjs from 'dayjs';

export default () => {
  const created = faker.date.between(
    dayjs().subtract(1, 'week').format(),
    dayjs().format(),
  );

  return {
    created_at: created,
    status: faker.random.arrayElement(['active', 'inactive', 'archived']),
    updated_at: faker.date.between(
      created,
      dayjs().format(),
    ),
  };
};
