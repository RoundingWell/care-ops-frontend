const faker = require('@roundingwellos/faker');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      birth_date: faker.date.past(40, '2010-01-01'),
      sex: faker.random.arrayElement(['m', 'f']),
      status: faker.random.arrayElement(['active', 'inactive']),
    };
  },
};
