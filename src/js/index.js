function startApp({ token, name }) {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ default: app }) => {
      app.start({ token, name });
    });
}

function startAuth(config) {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login }) => {
      login(startApp, config);
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
    startApp({
      token: sessionStorage.getItem('cypress'),
      name: 'Cypress Clinic',
    });
    return;
  }

  getConfig();
});
