const webpackOptions = require('../webpack.config.js');
const istanbul = require('istanbul-lib-coverage');
const fs = require('fs-extra');

module.exports = (on, config) => {
  if (config.env.COVERAGE) {
    webpackOptions.devtool = 'eval-cheap-module-source-map';
    webpackOptions.module.rules[0].use.options.plugins = ['istanbul'];

    process.env.NODE_ENV = 'test';

    const coverageFile = `${ config.coverageFolder }/out.json`;
    const coverageMap = istanbul.createCoverageMap({});

    fs.readJson(coverageFile, (err, previousCoverage) => {
      if (previousCoverage) coverageMap.merge(previousCoverage);
    });

    on('task', {
      coverage(coverage) {
        coverageMap.merge(coverage);
        return coverageMap;
      },
      write() {
        fs.outputJson(coverageFile, coverageMap);
        return coverageMap;
      },
    });
  }
};
