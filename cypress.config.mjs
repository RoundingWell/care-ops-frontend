import { defineConfig } from 'cypress';
import webpackProcessor from '@cypress/webpack-preprocessor';

import coveragePlugin from './test/plugins/coverage.js';
import fakerPlugin from './test/plugins/faker-generator.js';
import webpackOptions from './test/webpack.config.js';

fakerPlugin();

export default defineConfig({
  component: {
    specPattern: 'src/**/*.cy.js',
  },
  e2e: {
    baseUrl: 'http://localhost:8090/',
    excludeSpecPattern: [
      '*.md',
      '*.import.js',
    ],
    specPattern: 'test/integration/**/*.js',
    supportFile: 'test/support/index.js',
    setupNodeEvents(on, config) {
      coveragePlugin(on, config);
      on('file:preprocessor', webpackProcessor({ webpackOptions }));
    },
  },
  env: {
    featureFlags: {},
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  projectId: 'ep9zr6',
  coverageFolder: 'coverage',
  screenshotsFolder: 'test/reports/screenshots',
  fixturesFolder: 'test/fixtures',
  videosFolder: 'test/reports/videos',
  viewportWidth: 1280,
  viewportHeight: 768,
});
