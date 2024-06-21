import _ from 'underscore';
import fs from 'fs-extra';
const files = fs.readdirSync('./test/fixtures/config');

export default () => {
  _.each(files, async file => {
    const generate = await import(`../fixtures/config/${ file }`);
    const dest = `./test/fixtures/collections/${ file.split('.')[0] }.json`;
    const collection = _.times(50, generate.default);

    fs.writeFile(dest, JSON.stringify(collection, null, 2), e => {
      if (e) {
        throw e;
      }
    });
  });
};
