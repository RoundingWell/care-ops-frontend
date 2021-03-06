// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)


const _ = require('underscore');

// FIXME: Waiting on https://github.com/cypress-io/cypress/issues/8900
const webpackProcessor = require('cypress-webpack-preprocessor-v5');

const setStateColors = require('./state-colors.js');

const fakerGenerator = require('./faker-generator.js');

const webpackOptions = require('./webpack.config.js');

let coverageMap;

module.exports = (on, config) => {
  fakerGenerator();
  config.env = setStateColors(config.env);

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

  on('file:preprocessor', webpackProcessor({ webpackOptions }));

  return config;
};
