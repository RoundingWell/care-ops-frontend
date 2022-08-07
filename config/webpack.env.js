const path = require('path');
const dayjs = require('dayjs');
const utcPlugin = require('dayjs/plugin/utc');
dayjs.extend(utcPlugin);

module.exports = {
  isCI: !!process.env.CI,
  isE2E: !!process.env.E2E,
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  jsRoot: path.resolve(process.cwd(), './src/js'),
  sassRoot: path.resolve(process.cwd(), './src/scss'),
  outputPath: path.resolve(process.cwd(), './dist'),
  datePrefix: dayjs.utc().format('YYYYMMDD'),
};
