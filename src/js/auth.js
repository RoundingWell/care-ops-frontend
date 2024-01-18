import { extend } from 'underscore';
import Radio from 'backbone.radio';
import createKindeClient from '@kinde-oss/kinde-auth-pkce-js';

import { kindeConfig as config, appConfig } from './config';

import 'scss/app-root.scss';

import { LoginPromptView } from 'js/views/globals/prelogin/prelogin_views';

const PATH_ROOT = '/';
const PATH_RWELL = '/rw';
const PATH_AUTHD = '/authenticated';
const PATH_LOGIN = '/login';
const PATH_LOGOUT = '/logout';

let kinde;
let token;

// Sets a token when not using auth0;
function setToken(tokenString) {
  token = tokenString;
}

function getToken() {
  if (token) return token;
  if (!kinde || !navigator.onLine) return;

  return kinde
    .getToken()
    .catch(() => {
      logout();
    });
}

function logout() {
  token = null;
  window.location = '/logout';
}

Radio.reply('auth', {
  logout,
  setToken,
  getToken,
});

/*
 * Modifies the current history state
 */
function replaceState(state) {
  window.history.replaceState({}, document.title, state);
}

function login(path = PATH_ROOT, connection = config.connections.default) {
  // iframe buster
  if (top !== self) {
    top.location = PATH_LOGIN;
    return;
  }

  replaceState(PATH_LOGIN);

  const loginPromptView = new LoginPromptView();

  loginPromptView.on('click:login', ()=> {
    kinde.register({
      app_state: { path },
      authUrlParams: { connection_id: connection },
    });
  });

  loginPromptView.render();
}

/*
 * Requests kinde authorization
 * And authenticates authorization if kinde redirected to PATH_AUTHD
 */
async function auth(success) {
  if (appConfig.cypress) {
    setToken(appConfig.cypress);
    success();
    return;
  }

  if (!navigator.onLine) {
    success();
    return;
  }

  // NOTE: Set path before await create to avoid redirect replaceState changing the value
  const pathName = location.pathname;

  const kindeCreateParams = {
    redirect_uri: location.origin + PATH_AUTHD,
    logout_uri: location.origin,
    on_redirect_callback: (user, { path } = {}) => {
      if (!user) {
        login(path);
        return;
      }

      if (path === PATH_LOGIN) path = PATH_ROOT;

      if (path === PATH_RWELL) {
        path = PATH_ROOT;
        localStorage.setItem(PATH_RWELL, 1);
      }

      replaceState(path);

      success();
    },
  };

  kinde = await createKindeClient(extend(kindeCreateParams, config.createParams));

  if (pathName === PATH_AUTHD) return;

  if (pathName === PATH_LOGOUT) {
    kinde.logout();
    return;
  }

  // RWell specific login
  if (pathName === PATH_RWELL || localStorage.getItem(PATH_RWELL)) {
    login(PATH_RWELL, config.connections.roundingwell);
    return;
  }

  if (!await kinde.getUser()) {
    login(pathName);
    return;
  }

  success();
}

export {
  auth,
};
