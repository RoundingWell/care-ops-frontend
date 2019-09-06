function startApp({ token }) {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ default: app }) => {
      app.start({ token });
    });
}

function startAuth() {
  if (_DEVELOP_ && sessionStorage.getItem('cypress')) {
    startApp({ token: sessionStorage.getItem('cypress') });
    return;
  }

  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login }) => {
      login(startApp);
    });
}

document.addEventListener('DOMContentLoaded', startAuth);
