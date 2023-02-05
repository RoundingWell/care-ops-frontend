import { extend, pick } from 'underscore';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import Radio from 'backbone.radio';

import { auth0Config as config } from './config';

import 'scss/app-root.scss';

import { LoginPromptView } from 'js/views/globals/prelogin/prelogin_views';

let auth0;
const rwConnection = 'google-oauth2';
const RWELL_KEY = 'rw';
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
 * authenticate parses the implicit flow hash to determine the token
 * if there is an error it forces a new authorization with a new login
 * If successful, redirects to the initial path and sends the app
 * the token and config org name
 */
function authenticate(success) {
  return auth0.handleRedirectCallback().then(({ appState }) => {
    if (appState === '/login') appState = '/';

    if (appState === RWELL_KEY) {
      appState = '/';
      localStorage.setItem(RWELL_KEY, 1);
    }

    window.history.replaceState({}, document.title, appState);
    success({ name: config.name });
  });
}

/*
 * login will occur for any pre-auth flow
 * initially requesting auth0 authorization
 * And authenticating authorization if auth0 redirected to AUTHD_PATH
 */
function login(success) {
  if (!navigator.onLine) {
    success({ name: config.name });
    return;
  }

  const AUTHD_PATH = '/authenticated';
  config.redirect_uri = location.origin + AUTHD_PATH;
  config.audience = 'care-ops-backend';

  if (localStorage.getItem(RWELL_KEY)) {
    config.connection = rwConnection;
  }

  const clientConfig = {
    authorizationParams: config,
    ...pick(config, 'clientId', 'domain'),
  };

  createAuth0Client(clientConfig).then(auth0Client => {
    auth0 = auth0Client;
    return auth0.isAuthenticated();
  }).then(authed => {
    if (location.pathname === '/logout') {
      logout();
      return;
    }

    // RWell specific login
    if (location.pathname === `/${ RWELL_KEY }`) {
      loginWithRedirect({
        appState: RWELL_KEY,
        authorizationParams: {
          connection: rwConnection,
        },
      });
      return;
    }

    if (location.pathname === AUTHD_PATH) {
      authenticate(success).catch(() => {
        forceLogin();
      });
      return;
    }

    if (!authed) {
      forceLogin(location.pathname);
      return;
    }

    if (location.pathname === '/login') {
      window.history.replaceState({}, document.title, '/');
    }

    success({ name: config.name });
  });
}

function logout() {
  const federated = Radio.request('bootstrap', 'currentOrg:setting', 'federated_logout');
  localStorage.removeItem(RWELL_KEY);
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

  const connection = String(config.connection);

  if (connection === 'Username-Password-Authentication' || connection.includes('-userpass')) {
    return loginWithRedirect({ appState });
  }

  window.history.replaceState({}, document.title, '/login');

  const loginPromptView = new LoginPromptView();

  loginPromptView.on('click:login', ()=> {
    loginWithRedirect({ appState });
  });

  loginPromptView.render();
}

export {
  setToken,
  getToken,
  login,
  logout,
};
