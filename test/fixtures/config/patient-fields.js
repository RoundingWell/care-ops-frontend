const faker = require('@roundingwellos/faker');

module.exports = {
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: faker.lorem.word(),
      value: faker.datatype.number(),
    };
  },
};
