import $ from 'jquery';
import { extend } from 'underscore';
import Radio from 'backbone.radio';

import 'sass/app-root.scss';

const configVersion = '4';

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

function startAuth(config) {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login, logout }) => {
      login(startApp, config);
      Radio.reply('auth', {
        logout() {
          localStorage.removeItem(`config${ configVersion }`);
          logout();
        },
      });
    });
}

function getConfig() {
  const config = localStorage.getItem(`config${ configVersion }`);

  if (config) {
    startAuth(JSON.parse(config));
    return;
  }

  import(/* webpackChunkName: "config" */'./config')
    .then(({ fetchConfig }) => {
      fetchConfig(startAuth, configVersion);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const isForm = /^\/formapp\//.test(location.pathname);

  if (isForm) {
    startForm();
    return;
  }

  const ajaxSetup = {
    contentType: 'application/vnd.api+json',
    statusCode: {
      401() {
        Radio.request('auth', 'logout');
      },
      500() {
        Radio.trigger('event-router', 'error');
      },
    },
  };

  if ((_DEVELOP_ || _E2E_) && sessionStorage.getItem('cypress')) {
    $.ajaxSetup(extend(ajaxSetup, {
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${ sessionStorage.getItem('cypress') }`);
      },
    }));

    startApp({ name: 'Cypress Clinic' });
    return;
  }

  $.ajaxSetup(ajaxSetup);

  getConfig();
});
