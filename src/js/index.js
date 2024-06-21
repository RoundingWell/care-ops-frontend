import 'core-js/modules/web.dom-exception.stack';
import 'core-js/modules/web.structured-clone';
import { Workbox } from 'workbox-window';

import { fetchConfig, versions, appConfig } from './config';
import { initDataDog } from './datadog';

import getRootRoute from 'js/utils/root-route';

if (_PRODUCTION_ && 'serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.register();
}

function startOutreach() {
  import('./outreach/index')
    .then(({ startOutreachApp }) => {
      startOutreachApp();
    });
}

function startForm() {
  import('./formapp')
    .then(({ startFormApp }) => {
      startFormApp();
    });
}

function start() {
  import('./app')
    .then(({ startApp }) => {
      startApp();
    });
}

function startFormService() {
  import('./formservice')
    .then(({ startFormServiceApp }) => {
      startFormServiceApp();
    });
}

function startAuth() {
  import('./auth')
    .then(({ auth }) => {
      auth(start);
    });
}

function startApps({ isForm, isOutreach }) {
  if (isOutreach) {
    startOutreach();
    return;
  }

  if (isForm) {
    startForm();
    return;
  }

  startAuth();
}

document.addEventListener('DOMContentLoaded', () => {
  const rootRoute = getRootRoute();
  const isFormService = rootRoute === 'formservice';

  if (isFormService) {
    startFormService();
    return;
  }

  const isForm = rootRoute === 'formapp';
  const isOutreach = rootRoute === 'outreach';

  if (_TEST_) {
    versions.frontend = 'cypress';
    appConfig.name = 'Cypress Clinic';
    appConfig.cypress = 'cypress';

    if (location.pathname === '/logout') return;

    startApps({ isForm, isOutreach });
    return;
  }

  fetchConfig(() => {
    initDataDog({ isForm });

    startApps({ isForm, isOutreach });
  });
});
