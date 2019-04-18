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
const path = require('path');
const webpackProcessor = require('@cypress/webpack-preprocessor');

const setStateColors = require('./state-colors.js');

let coverageMap;

const webpackOptions = require('./webpack.config.js');

module.exports = (on, config) => {
  config.env = setStateColors(config.env);

  if (config.env.coverage) {
    process.env.NODE_ENV = 'test';

    const istanbul = require('istanbul-lib-coverage');
    coverageMap = istanbul.createCoverageMap({});

    on('task', {
      'coverage'(coverage) {
        coverageMap.merge(coverage);
        return JSON.stringify(coverageMap);
      },
    });
  }

  // If running in ci throw additional linter errors
  if (config.env.ci) {
    const esLintLoader = _.find(webpackOptions.module.rules, { loader: 'eslint-loader' });

    esLintLoader.options.configFile = path.resolve(process.cwd(), './tests/.eslintrc-ci');
  }

  on('file:preprocessor', webpackProcessor({ webpackOptions }));

  return config;
};
