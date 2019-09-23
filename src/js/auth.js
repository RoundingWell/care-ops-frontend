import auth0 from 'auth0-js';

const AUTHD_PATH = '/authenticated';

let webAuth;

function authorize(connection, prompt = 'none') {
  webAuth.authorize({
    responseType: 'id_token',
    responseMode: 'fragment',
    redirectUri: window.location.origin + AUTHD_PATH,
    connection,
    prompt,
  });
}

/*
 * authenticate parses the implicit flow hash to determine the token
 * if there is an error it forces a new authorization with a new login
 * If successful, redirects to the initial path and sends the app
 * the token and config org name
 */
function authenticate(success, { name, connection }) {
  webAuth.parseHash({}, (authErr, authResult) => {
    if (authErr) {
      authorize(connection, 'login');
      return;
    }

    window.history.replaceState({}, document.title, localStorage.getItem('redirectPath') || '/');
    localStorage.removeItem('redirectPath');

    success({
      token: authResult.idToken,
      name,
    });
  });
}

/*
 * login will occur for any pre-auth flow
 * initially requesting auth0 authorization
 * And authenticating authorization if auth0 redirected to AUTHD_PATH
 */
function login(success, config) {
  webAuth = new auth0.WebAuth(config);

  if (window.location.pathname === AUTHD_PATH) {
    return authenticate(success, config);
  }

  localStorage.setItem('redirectPath', window.location.pathname);

  authorize(config.connection);
}

function logout() {
  localStorage.removeItem('config');
  webAuth.logout({
    returnTo: window.location.origin,
  });
}

export {
  login,
  logout,
};

