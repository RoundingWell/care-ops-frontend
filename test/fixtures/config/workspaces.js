import faker from '@roundingwellos/faker';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.bs(),
    slug: faker.lorem.word(),
    settings: {},
  };
};
