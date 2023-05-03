import 'core-js/modules/web.dom-exception.stack';
import 'core-js/modules/web.structured-clone';
import { Workbox } from 'workbox-window';

import { fetchConfig, versions } from './config';
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
    .then(({ default: app }) => {
      app.start({ name });
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

document.addEventListener('DOMContentLoaded', () => {
  const rootRoute = getRootRoute();
  const isForm = rootRoute === 'formapp';
  const isOutreach = rootRoute === 'outreach';
  const isFormService = rootRoute === 'formservice';

  if (isFormService) {
    startFormService();
    return;
  }

  if ((_DEVELOP_ || _E2E_) && sessionStorage.getItem('cypress')) {
    versions.frontend = 'cypress';

    if (isOutreach) {
      startOutreach();
      return;
    }

    if (isForm) {
      startForm();
      return;
    }

    import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
      .then(({ setToken }) => {
        setToken(sessionStorage.getItem('cypress'));
        startApp({ name: 'Cypress Clinic' });
      });
    return;
  }

  fetchConfig(() => {
    initDataDog({ isForm });

    if (isOutreach) {
      startOutreach();
      return;
    }

    if (isForm) {
      startForm();
      return;
    }

    startAuth();
  });
});
