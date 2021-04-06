const faker = require('faker');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      birth_date: faker.date.past(40, '2010-01-01'),
    };
  },
};
