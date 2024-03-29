import { defineConfig } from 'cypress';
import webpackProcessor from '@cypress/webpack-preprocessor';

import coveragePlugin from './test/plugins/coverage.js';
import fakerPlugin from './test/plugins/faker-generator.js';
import webpackOptions from './test/webpack.config.js';

fakerPlugin();

function setupNodeEvents(on, config) {
  coveragePlugin(on, config);
  on('file:preprocessor', webpackProcessor({ webpackOptions }));
}

export default defineConfig({
  component: {
    specPattern: 'src/**/*.cy.js',
    indexHtmlFile: 'test/support/component.html',
    supportFile: 'test/support/component.js',
    devServer: {
      bundler: 'webpack',
      webpackConfig: webpackOptions,
    },
    setupNodeEvents,
  },
  e2e: {
    baseUrl: 'http://localhost:8090/',
    excludeSpecPattern: [
      '*.md',
      '*.import.js',
    ],
    specPattern: 'test/integration/**/*.js',
    supportFile: 'test/support/e2e.js',
    setupNodeEvents,
    experimentalRunAllSpecs: true,
  },
  env: {
    featureFlags: {},
  },
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 5,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  projectId: 'ep9zr6',
  coverageFolder: 'coverage',
  screenshotsFolder: 'test/reports/screenshots',
  fixturesFolder: 'test/fixtures',
  video: false,
  viewportWidth: 1280,
  viewportHeight: 768,
});
