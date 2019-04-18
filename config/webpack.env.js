const path = require('path');

module.exports = {
  isProduction: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test',
  jsRoot: path.resolve(process.cwd(), './src/js'),
  sassRoot: path.resolve(process.cwd(), './src/sass'),
  outputPath: path.resolve(process.cwd(), './dist'),
};
