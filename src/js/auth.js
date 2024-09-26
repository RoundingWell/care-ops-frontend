import Radio from 'backbone.radio';

import { appConfig } from './config';

import { auth as auth0, logout as auth0Logout, setToken as auth0SetToken, getToken as auth0GetToken } from './auth0';

import 'scss/app-root.scss';

// import { LoginPromptView } from 'js/views/globals/prelogin/prelogin_views';

// const PATH_ROOT = '/';
// const PATH_RWELL = '/rw';
// const PATH_AUTHD = '/authenticated';
// const PATH_LOGIN = '/login';
// const PATH_LOGOUT = '/logout';

// function shouldAuth0() {
//   return !config.createParams;
// }

// let kinde;
// let token;

// Sets a token when not using auth0;
function setToken(tokenString) {
  // if (shouldAuth0())
  return auth0SetToken(tokenString);

  // token = tokenString;
}

function getToken() {
  // if (shouldAuth0())
  return auth0GetToken();

  // if (token) return token;
  // if (!kinde || !navigator.onLine) return;

  // return kinde
  //   .getToken()
  //   .catch(() => {
  //     logout();
  //   });
}

function logout() {
  // if (shouldAuth0())
  return auth0Logout();

  // token = null;
  // window.location = '/logout';
}

Radio.reply('auth', {
  logout,
  setToken,
  getToken,
});

/*
 * Modifies the current history state
 */
// function replaceState(state) {
//   window.history.replaceState({}, document.title, state);
// }

// function login(path = PATH_ROOT, connection /* = config.connections.default */) {
//   // iframe buster
//   if (top !== self) {
//     top.location = PATH_LOGIN;
//     return;
//   }

//   replaceState(PATH_LOGIN);

//   if (appConfig.disableLoginPrompt) {
//     // registerKinde(path, connection);
//     return;
//   }

//   const loginPromptView = new LoginPromptView();

//   loginPromptView.on('click:login', ()=> {
//     // registerKinde(path, connection);
//   });

//   loginPromptView.render();
// }

function shouldAuth() {
  if (appConfig.cypress) {
    setToken(appConfig.cypress);
    return false;
  }

  if (!navigator.onLine) {
    return false;
  }

  return true;
}

// async function createKinde(success) {
//   const kindeCreateParams = {
//     redirect_uri: location.origin + PATH_AUTHD,
//     logout_uri: location.origin,
//     on_redirect_callback: (user, { path } = {}) => {
//       if (!user) {
//         login(path);
//         return;
//       }

//       if (path === PATH_LOGIN) path = PATH_ROOT;

//       if (path === PATH_RWELL) {
//         path = PATH_ROOT;
//         localStorage.setItem(PATH_RWELL, 1);
//       }

//       replaceState(path);

//       success();
//     },
//   };

//   return createKindeClient(extend(kindeCreateParams, config.createParams));
// }

/*
 * Requests kinde authorization
 * And authenticates authorization if kinde redirected to PATH_AUTHD
 */
async function auth(success) {
  if (!shouldAuth()) return success();

  // if (shouldAuth0())
  return auth0(success);

  // // NOTE: Set path before await create to avoid redirect replaceState changing the value
  // const pathName = location.pathname;

  // kinde = await createKinde(success);

  // if (pathName === PATH_AUTHD) return;

  // if (pathName === PATH_LOGOUT) {
  //   kinde.logout();
  //   return;
  // }

  // // RWell specific login
  // if (pathName === PATH_RWELL || localStorage.getItem(PATH_RWELL)) {
  //   login(PATH_RWELL, config.connections.roundingwell);
  //   return;
  // }

  // if (!await kinde.getUser()) {
  //   login(pathName);
  //   return;
  // }

  // success();
}

export {
  auth,
};
