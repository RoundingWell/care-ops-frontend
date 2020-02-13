import $ from 'jquery';
import _ from 'underscore';
import Radio from 'backbone.radio';
import 'js/utils/formatting';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/app-root.scss';

const configVersion = '3';


function startPreloader() {
  const preloadRegion = new PreloadRegion({ el: '#root' });
  preloadRegion.startPreloader();
}

function start(opts) {
  startPreloader();

  const isForm = _.startsWith(location.pathname, '/formapp/');

  if (isForm) {
    startForm(opts);
    return;
  }

  startApp(opts);
}

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
      login(start, config);
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
  const ajaxSetup = {
    contentType: 'application/vnd.api+json',
    statusCode: {
      401() {
        Radio.request('auth', 'logout');
      },
      403() {
        Radio.trigger('event-router', 'forbidden');
      },
      500() {
        Radio.trigger('event-router', 'error');
      },
    },
  };

  if ((_DEVELOP_ || _E2E_) && sessionStorage.getItem('cypress')) {
    $.ajaxSetup(_.extend(ajaxSetup, {
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${ sessionStorage.getItem('cypress') }`);
      },
    }));

    start({ name: 'Cypress Clinic' });
    return;
  }

  $.ajaxSetup(ajaxSetup);

  getConfig();
});
