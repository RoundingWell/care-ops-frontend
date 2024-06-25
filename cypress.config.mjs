import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
import { cypressConfig } from './vite.config.js';

import coveragePlugin from './test/plugins/coverage.js';
import fakerPlugin from './test/plugins/faker-generator.js';

fakerPlugin();

process.env.NODE_ENV = 'test';

function setupNodeEvents(on, config) {
  coveragePlugin(on, config);
  on(
    'file:preprocessor',
    vitePreprocessor({
      configFile: false,
      ...cypressConfig,
    }),
  );
}

export default defineConfig({
  component: {
    specPattern: 'src/**/*.cy.js',
    indexHtmlFile: 'test/support/component.html',
    supportFile: 'test/support/component.js',
    setupNodeEvents,
    devServer: {
      framework: 'marionette',
      bundler: 'vite',
    },
  },

  e2e: {
    baseUrl: 'http://localhost:8090/',
    excludeSpecPattern: ['*.md', '*.import.js'],
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
