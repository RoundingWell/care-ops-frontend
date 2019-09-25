import _ from 'underscore';
import 'js/utils/formatting';

function start(opts) {
  const isForm = _.startsWith(window.location.pathname, '/formapp/');

  if (isForm) {
    startForm(opts);
    return;
  }

  startApp(opts);
}

function startForm({ token }) {
  import(/* webpackChunkName: "formapp" */'./formapp')
    .then(({ loadForm }) => {
      loadForm({ token });
    });
}

function startApp({ token, name }) {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ default: app }) => {
      app.start({ token, name });
    });
}

function startAuth(config) {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login }) => {
      login(start, config);
    });
}

function getConfig() {
  const config = localStorage.getItem('config');

  if (config) {
    startAuth(JSON.parse(config));
    return;
  }

  import(/* webpackChunkName: "config" */'./config')
    .then(({ fetchConfig }) => {
      fetchConfig(startAuth);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (_DEVELOP_ && sessionStorage.getItem('cypress')) {
    start({
      token: sessionStorage.getItem('cypress'),
      name: 'Cypress Clinic',
    });
    return;
  }

  getConfig();
});
