const webpackOptions = require('./webpack.config.js');

let coverageMap;

module.exports = (on, config) => {
  if (config.env.COVERAGE) {
    webpackOptions.devtool = 'eval-cheap-module-source-map';
    webpackOptions.module.rules[0].use.options.plugins = ['istanbul'];

    process.env.NODE_ENV = 'test';

    const istanbul = require('istanbul-lib-coverage');
    coverageMap = istanbul.createCoverageMap({});
    on('task', {
      coverage(coverage) {
        coverageMap.merge(coverage);
        return JSON.stringify(coverageMap);
      },
    });
  }
};
