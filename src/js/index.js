function startApp({ token }) {
  import(/* webpackChunkName: "app" */'./app')
    .then(({ default: app }) => {
      app.start({ token });
    });
}

function startAuth() {
  import(/* webpackPrefetch: true, webpackChunkName: "auth" */ './auth')
    .then(({ login }) => {
      login(startApp);
    });
}

document.addEventListener('DOMContentLoaded', startAuth);
