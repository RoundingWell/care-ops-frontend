const path = require('path');

module.exports = {
  isCI: process.env.CI,
  isProduction: process.env.NODE_ENV === 'production',
  jsRoot: path.resolve(process.cwd(), './src/js'),
  sassRoot: path.resolve(process.cwd(), './src/sass'),
  outputPath: path.resolve(process.cwd(), './dist'),
};
