const faker = require('faker');

module.exports = {
  generate() {
    return {
      id: faker.random.uuid(),
      sequence: faker.random.number(100),
    };
  },
  
  
  
};
