const webpackOptions = require('../webpack.config.js');
const fs = require('fs-extra');

let coverageMap;

module.exports = (on, config) => {
  if (!config.env.COVERAGE) return;
  webpackOptions.devtool = 'eval-cheap-module-source-map';
  webpackOptions.module.rules[0].use.options.plugins = ['istanbul'];

  process.env.NODE_ENV = 'test';

  const coverageFile = `${ config.coverageFolder }/out.json`;
  const istanbul = require('istanbul-lib-coverage');
  coverageMap = istanbul.createCoverageMap({});

  on('task', {
    coverage(coverage) {
      coverageMap.merge(coverage);
      return JSON.stringify(coverageMap);
    },
    async write() {
      if (config.isInteractive) {
        const coverage = fs.readJsonSync(coverageFile, { throws: false });

        if (coverage) coverageMap.merge(coverage);
      }

      await fs.outputJson(coverageFile, coverageMap);

      return config.isInteractive;
    },
  });
};
