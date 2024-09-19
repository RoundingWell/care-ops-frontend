import faker from '@roundingwellos/faker';

export default () => {
  return {
    id: faker.datatype.uuid(),
    name: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
    options: {},
  };
};
