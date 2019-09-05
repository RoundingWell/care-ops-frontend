import auth0 from 'auth0-js';

const AUTHD_PATH = '/authenticated';

const webAuth = new auth0.WebAuth({
  clientID: 'zmfrKoBuMKsm5H4ZekNHeA4FRzIS44cz',
  domain: 'roundingwell-care-team.auth0.com',
});

function authorize(prompt = 'none') {
  webAuth.authorize({
    responseType: 'id_token',
    responseMode: 'fragment',
    redirectUri: window.location.origin + AUTHD_PATH,
    prompt,
  });
}

function authenticate(success) {
  webAuth.parseHash({}, (authErr, authResult) => {
    if (authErr) {
      authorize('login');
      return;
    }

    window.history.replaceState({}, document.title, localStorage.getItem('redirectPath'));
    localStorage.removeItem('redirectPath');

    success({
      token: authResult.idToken,
    });
  });
}

function login(success) {
  if (window.location.pathname === AUTHD_PATH) {
    return authenticate(success);
  }

  localStorage.setItem('redirectPath', window.location.pathname);

  authorize();
}

function logout() {
  webAuth.logout({
    returnTo: window.location.origin,
  });
}

export {
  login,
  logout,
};

