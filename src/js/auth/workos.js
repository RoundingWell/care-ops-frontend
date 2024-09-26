import { extend, isEmpty } from 'underscore';

import { createClient } from '@workos-inc/authkit-js';

import { workosConfig as config, appConfig } from 'js/config';

import { LoginPromptView } from 'js/views/globals/prelogin/prelogin_views';

import { PATH_ROOT, PATH_RWELL, PATH_AUTHD, PATH_LOGIN, PATH_LOGOUT } from '.config';

let token;
let authkit;

function setToken(tokenString) {
  token = tokenString;
}

function getToken() {
  if (token) return token;
  if (!authkit || !navigator.onLine) return;

  return authkit
    .getAccessToken()
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

function login(state = PATH_ROOT) {
  // iframe buster
  if (top !== self) {
    top.location = PATH_LOGIN;
    return;
  }

  if (appConfig.disableLoginPrompt) {
    authkit.signIn({ state });
    return;
  }

  replaceState(PATH_LOGIN);

  const loginPromptView = new LoginPromptView();

  loginPromptView.on('click:login', ()=> {
    authkit.signIn({ state });
  });

  loginPromptView.render();
}

async function createAuthkit(success, pathName) {
  const isRW = pathName === PATH_RWELL || localStorage.getItem(PATH_RWELL);

  const createClientOptions = {
    redirectUri: location.origin + PATH_AUTHD,
    onRedirectCallback: ({ user, state }) => {
      if (!user) {
        login(state);
        return;
      }

      if (state === PATH_LOGIN) state = PATH_ROOT;

      if (state === PATH_RWELL) {
        state = PATH_ROOT;
        localStorage.setItem(PATH_RWELL, 1);
      }

      replaceState(state);

      success();
    },
  };

  return createClient(isRW ? config.rwClientId : config.clientId, extend(createClientOptions, config.createClientOptions));
}

/*
 * Requests authorization
 * And authenticates authorization if redirected to PATH_AUTHD
 */

async function auth(success) {
  // NOTE: Set path before await create to avoid redirect replaceState changing the value
  const pathName = location.pathname;

  authkit = await createAuthkit(success, pathName);

  if (pathName === PATH_AUTHD) return;

  if (pathName === PATH_LOGOUT) {
    authkit.signOut();
    return;
  }

  if (!await authkit.getUser()) {
    login(pathName);
    return;
  }

  success();
}

function logout() {
  token = null;
  window.location = PATH_LOGOUT;
}

function should() {
  return !isEmpty(appConfig.workos);
}

export {
  auth,
  logout,
  setToken,
  getToken,
  should,
};
