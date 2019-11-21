import $ from 'jquery';
import createAuth0Client from '@auth0/auth0-spa-js';

import { LoginPromptView } from 'js/views/globals/login/login-prompt_views';

let auth0;
const rwConnection = 'google-oauth2';

/*
 * authenticate parses the implicit flow hash to determine the token
 * if there is an error it forces a new authorization with a new login
 * If successful, redirects to the initial path and sends the app
 * the token and config org name
 */
function authenticate(success, config) {
  return auth0.handleRedirectCallback().then(({ appState }) => {
    if (appState === 'rw') {
      appState = '/';
      config.connection = rwConnection;
      localStorage.setItem(`config${ config.configVersion }`, JSON.stringify(config));
    }

    ajaxSetup();
    window.history.replaceState({}, document.title, appState);
    success({ name: config.name });
  });
}

/*
 * login will occur for any pre-auth flow
 * initially requesting auth0 authorization
 * And authenticating authorization if auth0 redirected to AUTHD_PATH
 */
function login(success, config) {
  const AUTHD_PATH = '/authenticated';
  config.redirect_uri = location.origin + AUTHD_PATH;
  config.audience = 'care-ops-backend';

  createAuth0Client(config).then(auth0Client => {
    auth0 = auth0Client;
    return auth0.isAuthenticated();
  }).then(authed => {
    if (location.pathname === '/logout') {
      logout();
      return;
    }

    // RWell specific login
    if (location.pathname === '/rw') {
      rwellLogin();
      return;
    }

    if (location.pathname === AUTHD_PATH) {
      authenticate(success, config).catch(() => {
        forceLogin();
      });
      return;
    }

    if (!authed) {
      forceLogin(location.pathname);
      return;
    }

    auth0.loginWithRedirect({
      appState: location.pathname,
      prompt: 'none',
    });
  });
}

function logout() {
  auth0.logout({ returnTo: location.origin });
}

function rwellLogin() {
  auth0.loginWithRedirect({
    appState: 'rw',
    connection: rwConnection,
    prompt: 'login',
  });
}

function forceLogin(appState = '/') {
  if (appState === '/login') appState = '/';

  window.history.replaceState({}, document.title, '/login');

  const loginPromptView = new LoginPromptView();

  loginPromptView.on('click:login', ()=> {
    auth0.loginWithRedirect({
      appState,
      prompt: 'login',
    });
  });

  loginPromptView.render();
}

function ajaxSetup() {
  $(document).ajaxSend((event, jqxhr, settings) => {
    const origXhr = settings.xhr;
    settings.xhr = function() {
      const xhr = origXhr();
      const origSend = xhr.send;
      xhr.send = function() {
        const args = arguments;
        auth0
          .getTokenSilently()
          .then(token => {
            if (xhr.readyState === 1) {
              xhr.setRequestHeader('Authorization', `Bearer ${ token }`);
              origSend.apply(xhr, args);
            }
          })
          .catch(() => {
            forceLogin();
          });
      };
      return xhr;
    };
  });
}

export {
  login,
  logout,
};
