import faker from '@roundingwellos/faker';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.word(),
    value: faker.datatype.number(),
  };
};
