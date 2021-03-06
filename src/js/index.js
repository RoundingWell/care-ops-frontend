import $ from 'jquery';
import { extend, defer } from 'underscore';
import Radio from 'backbone.radio';

import { fetchConfig } from './config';
import { initDataDog } from './datadog';

import 'sass/app-root.scss';

function startForm() {
  import(/* webpackChunkName: "formapp" */'./formapp')
    .then(({ startFormApp }) => {
      startFormApp();
    });
}

function startApp({ name }) {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ default: app }) => {
      app.start({ name });
    });
}

function startAuth() {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login, logout }) => {
      login(startApp);
      Radio.reply('auth', {
        logout() {
          logout();
        },
      });
    });
}

const ajaxSetup = {
  contentType: 'application/vnd.api+json',
  statusCode: {
    401() {
      defer(() => {
        Radio.request('auth', 'logout');
      });
    },
    500() {
      Radio.trigger('event-router', 'error');
    },
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const isForm = /^\/formapp\//.test(location.pathname);

  if ((_DEVELOP_ || _E2E_) && sessionStorage.getItem('cypress')) {
    if (isForm) {
      startForm();
      return;
    }

    $.ajaxSetup(extend(ajaxSetup, {
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${ sessionStorage.getItem('cypress') }`);
      },
    }));

    startApp({ name: 'Cypress Clinic' });
    return;
  }

  fetchConfig(() => {
    initDataDog();

    if (isForm) {
      startForm();
      return;
    }

    $.ajaxSetup(ajaxSetup);

    startAuth();
  });
});
