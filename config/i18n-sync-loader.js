const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const merge = require('lodash.merge');

const { jsRoot } = require('./webpack.env.js');

function exportJson(source) {
  return `module.exports = ${ source }`;
}

module.exports = function(source) {
  if (this.cacheable) this.cacheable();

  const i18n = JSON.parse(source);

  // A separate object containing only locales gets passed through. Do nothing in that case
  // Do not parse/merge for en-US
  if (Object.keys(i18n).length <= 1 || i18n.locales === 'en-US') {
    return exportJson(source);
  }

  const filePath = path.resolve(process.cwd(), `${ jsRoot }/i18n/en-US.yml`);
  const i18nEnUs = yaml.load(fs.readFileSync(filePath, 'utf8'));

  return exportJson(JSON.stringify(merge({}, i18nEnUs, i18n)));
};
