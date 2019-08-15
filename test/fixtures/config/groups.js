const faker = require('faker');

module.exports = {
  count: 10,
  generate() {
    return {
      id: faker.random.uuid(),
      name: `${ faker.name.jobDescriptor() } ${ faker.name.jobArea() }`,
      short: faker.system.fileExt(),
    };
  },
};
