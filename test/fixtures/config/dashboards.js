import faker from '@roundingwellos/faker';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.name.title(),
    description: faker.lorem.sentences(),
    embed_url: faker.internet.url(),
  };
};
