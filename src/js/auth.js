import { extend } from 'underscore';
import Radio from 'backbone.radio';
import { createAuth0Client } from '@auth0/auth0-spa-js';

import { auth0Config as config, appConfig } from './config';

import 'scss/app-root.scss';

import { LoginPromptView } from 'js/views/globals/prelogin/prelogin_views';

const RWELL_KEY = 'rw';
const RWELL_CONNECTION = 'google-oauth2';
const AUTHD_PATH = '/authenticated';

let auth0;
let isLoggedIn;

function setAuth0(auth0Client) {
  auth0 = auth0Client;
  return auth0.isAuthenticated();
}

let token;

// Sets a token when not using auth0;
function setToken(tokenString) {
  token = tokenString;
}

function getToken() {
  if (token) return token;
  if (!auth0 || !navigator.onLine) return;

  return auth0
    .getTokenSilently()
    .catch(() => {
      logout();
    });
}

/*
 * Modifies the current history state
 */
function replaceState(state) {
  window.history.replaceState({}, document.title, state);
}

/*
 * authenticate parses the implicit flow hash to determine the token
 * if there is an error it forces a new authorization with a new login
 * If successful, redirects to the initial path and sends the app
 * the token and config org name
 */
function authenticate(success) {
  return auth0.handleRedirectCallback()
    .then(({ appState }) => {
      if (appState === '/login') appState = '/';

      if (appState === RWELL_KEY) {
        appState = '/';
        localStorage.setItem(RWELL_KEY, 1);
      }

      replaceState(appState);
      success();
    })
    .catch(() => {
      forceLogin();
    });
}

/*
 *  Take appconfig.auth0 and extend it with the default config
 */
function getConfig() {
  config.authorizationParams = extend({
    redirect_uri: location.origin + AUTHD_PATH,
    audience: 'care-ops-backend',
  }, config.authorizationParams);

  if (localStorage.getItem(RWELL_KEY)) {
    config.authorizationParams.connection = RWELL_CONNECTION;
  }

  return config;
}

/*
 * login will occur for any pre-auth flow
 * initially requesting auth0 authorization
 * And authenticating authorization if auth0 redirected to AUTHD_PATH
 */
function login(success) {
  if (appConfig.cypress) {
    setToken(appConfig.cypress);
    success();
    return;
  }

  if (!navigator.onLine) {
    success();
    return;
  }

  createAuth0Client(getConfig())
    .then(setAuth0)
    .then(isAuthenticated => {
      if (location.pathname === '/logout') {
        const federated = Radio.request('bootstrap', 'setting', 'federated_logout');
        logout({ federated });
        return;
      }

      // RWell specific login
      if (location.pathname === `/${ RWELL_KEY }`) {
        loginWithRedirect({
          appState: RWELL_KEY,
          authorizationParams: {
            connection: RWELL_CONNECTION,
          },
        });
        return;
      }

      if (location.pathname === AUTHD_PATH) {
        authenticate(success);
        return;
      }

      if (!isAuthenticated) {
        forceLogin(location.pathname);
        return;
      }

      if (location.pathname === '/login') {
        replaceState('/');
      }

      success();
    });
}

function logout({ federated } = {}) {
  if (!isLoggedIn) return;
  // Logout after 401
  if (!auth0) {
    window.location = '/logout';
  }
  auth0.logout({ logoutParams: { returnTo: location.origin, federated } });
}

function loginWithRedirect(opts) {
  auth0.loginWithRedirect(extend({ prompt: 'login' }, opts));
}

function forceLogin(appState = '/') {
  // iframe buster
  if (top !== self) {
    top.location = '/login';
    return;
  }

  const connection = String(config.authorizationParams.connection);

  if (connection === 'Username-Password-Authentication' || connection.includes('-userpass')) {
    return loginWithRedirect({ appState });
  }

  replaceState('/login');

  const loginPromptView = new LoginPromptView();

  loginPromptView.on('click:login', ()=> {
    loginWithRedirect({ appState });
  });

  loginPromptView.render();
}

function loginSuccess() {
  isLoggedIn = true;
}

Radio.reply('auth', {
  loginSuccess,
  logout,
  setToken,
  getToken,
});

export {
  login,
};
