import { isEmpty } from 'underscore';

import { /*  workosConfig as config, */ appConfig } from 'js/config';

import { PATH_LOGOUT } from '.config';

let token;

// Sets a token when not using auth0;
function setToken(tokenString) {
  token = tokenString;
}

function getToken() {
  if (token) return token;
  // if (!auth0 || !navigator.onLine) return;

  // return auth0
  //   .getTokenSilently()
  //   .catch(() => {
  //     logout();
  //   });
}

function auth(success) {
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
