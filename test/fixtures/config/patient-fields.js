const faker = require('faker');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      name: faker.lorem.word(),
      value: faker.random.number(),
    };
  },
};
