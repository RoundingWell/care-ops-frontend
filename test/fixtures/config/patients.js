import faker from '@roundingwellos/faker';

export default () => {
  return {
    id: faker.datatype.uuid(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    birth_date: faker.date.past(40, '2010-01-01'),
    sex: faker.random.arrayElement(['m', 'f']),
  };
};
