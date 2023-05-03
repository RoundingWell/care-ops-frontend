import 'core-js/modules/web.dom-exception.stack';
import 'core-js/modules/web.structured-clone';
import { Workbox } from 'workbox-window';

import { fetchConfig, versions, appConfig } from './config';
import { initDataDog } from './datadog';

import getRootRoute from 'js/utils/root-route';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.register();
}

function startOutreach() {
  import(/* webpackChunkName: "outreach" */'./outreach/index')
    .then(({ startOutreachApp }) => {
      startOutreachApp();
    });
}

function startForm() {
  import(/* webpackChunkName: "formapp" */'./formapp')
    .then(({ startFormApp }) => {
      startFormApp();
    });
}

function start() {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ startApp }) => {
      startApp();
    });
}

function startFormService() {
  import(/* webpackChunkName: "formservice" */'./formservice')
    .then(({ startFormServiceApp }) => {
      startFormServiceApp();
    });
}

function startAuth() {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login }) => {
      login(start);
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

  if ((_DEVELOP_ || _E2E_) && sessionStorage.getItem('cypress')) {
    versions.frontend = 'cypress';
    appConfig.name = 'Cypress Clinic';
    appConfig.cypress = sessionStorage.getItem('cypress');

    startApps({ isForm, isOutreach });
    return;
  }

  fetchConfig(() => {
    initDataDog({ isForm });

    startApps({ isForm, isOutreach });
  });
});
