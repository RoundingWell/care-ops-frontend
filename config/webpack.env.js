const path = require('path');

module.exports = {
  isCI: !!process.env.CI,
  isE2E: !!process.env.E2E,
  isProduction: process.env.NODE_ENV === 'production',
  jsRoot: path.resolve(process.cwd(), './src/js'),
  sassRoot: path.resolve(process.cwd(), './src/sass'),
  outputPath: path.resolve(process.cwd(), './dist'),
};
