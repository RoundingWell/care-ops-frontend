import Radio from 'backbone.radio';

import { appConfig } from './config';

import * as auth0 from './auth/auth0';
import * as workos from './auth/workos';

import 'scss/app-root.scss';

function setToken(tokenString) {
  if (workos.should()) return workos.setToken(tokenString);
  if (auth0.should()) return auth0.setToken(tokenString);
}

function getToken() {
  if (workos.should()) return workos.getToken();
  if (auth0.should()) return auth0.getToken();
}

function logout() {
  if (workos.should()) return workos.logout();
  if (auth0.should()) return auth0.logout();
}

Radio.reply('auth', {
  logout,
  setToken,
  getToken,
});

async function auth(success) {
  if (appConfig.cypress) {
    setToken(appConfig.cypress);
    return success();
  }

  if (!navigator.onLine) return success();

  if (workos.should()) return workos.auth(success);
  if (auth0.should()) return auth0.auth(success);
}

export {
  auth,
};
