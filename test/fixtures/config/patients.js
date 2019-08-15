const faker = require('faker');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      birth_date: faker.date.past(40, '2010-01-01'),
      sex: faker.random.arrayElement(['m', 'f']),
      mrn: `${ faker.random.number() }`,
    };
  },
};
