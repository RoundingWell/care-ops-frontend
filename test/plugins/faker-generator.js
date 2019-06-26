const _ = require('underscore');
const fs = require('fs');
const files = fs.readdirSync('./test/fixtures/config');

module.exports = () => {
  _.each(files, file => {
    const { generate } = require(`../fixtures/config/${ file }`);
    const dest = `./test/fixtures/collections/${ file.split('.')[0] }.json`;

    const collection = _.times(100, generate);

    fs.writeFile(dest, JSON.stringify(collection, null, 2), e => {
      if (e) {
        throw e;
      }
    });
  });
};
