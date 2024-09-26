import Radio from 'backbone.radio';

import * as auth0 from './auth/auth0';
import * as none from './auth/none';
import * as kinde from './auth/kinde';

import 'scss/app-root.scss';

let authAgent;

function getAuthAgent() {
  if (none.should()) return none;

  if (authAgent) return authAgent;

  // These should be ordered by priority lowest to highest
  if (auth0.should()) authAgent = auth0;
  if (kinde.should()) authAgent = kinde;

  return authAgent;
}

function setToken(tokenString) {
  getAuthAgent().setToken(tokenString);
}

function getToken() {
  getAuthAgent().getToken();
}

function logout() {
  getAuthAgent().logout();
}

Radio.reply('auth', {
  logout,
  setToken,
  getToken,
});

async function auth(success) {
  getAuthAgent().auth(success);
}

export {
  auth,
};
