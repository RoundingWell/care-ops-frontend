const faker = require('faker');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: faker.company.companyName(),
      domain: faker.hacker.noun(),
    };
  },
};
