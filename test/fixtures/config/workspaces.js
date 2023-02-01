const faker = require('@roundingwellos/faker');

module.exports = {
  count: 10,
  generate() {
    return {
      id: faker.datatype.uuid(),
      name: `${ faker.name.jobDescriptor() } ${ faker.name.jobArea() }`,
      slug: faker.system.fileExt(),
    };
  },
};
