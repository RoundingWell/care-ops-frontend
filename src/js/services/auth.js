import $ from 'jquery';
import auth0 from 'auth0-js';
import Radio from 'backbone.radio';

import App from 'js/base/app';

let token = sessionStorage.getItem('auth:token');
let expires = sessionStorage.getItem('auth:expires');

export default App.extend({
  channelName: 'auth',
  radioRequests: {
    'ajaxAuth': 'getAjaxAuth',
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'expires': 'getTokenExpiration',
    'logout': 'removeToken',
    'bootstrap': 'initBootstrap',
  },
  getAjaxAuth() {
    return {
      beforeSend(request) {
        request.setRequestHeader('Authorization', `Bearer ${ token }`);
      },
    };
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  getTokenExpiration() {
    return expires ? Date.parse(expires) : new Date();
  },
  isTokenExpired() {
    return this.getTokenExpiration() < (new Date());
  },
  removeToken() {
    token = null;
    expires = null;
    sessionStorage.removeItem('auth:token');
    sessionStorage.removeItem('auth:expires');
  },
  initBootstrap() {
    if (this.isTokenExpired()) {
      this.removeToken();
    }

    if (token) {
      const d = $.Deferred();
      $.when(Radio.request('entities', 'fetch:clinicians:current')).then(currentUser => {
        this.currentUser = currentUser;
        this.currentOrg = this.currentUser.getOrganization();
        d.resolve(currentUser);
      });
      return d.promise();
    }

    // https://auth0.com/docs/libraries/auth0js/v9#webauth-authorize-
    const auth = new auth0.WebAuth({
      clientID: '2eg7mz2db0B31gctULMTcgax1vdvgPip',
      domain: 'roundingwell-care-team.auth0.com',
      responseType: 'id_token',
      responseMode: 'fragment',
      redirectUri: window.location.toString(),
    });

    if (window.location.hash) {
      // https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
      return auth.parseHash({ hash: window.location.hash }, (authErr, authResult) => {
        if (authErr) {
          throw authErr;
        }

        // We use ID Token (JWT) because it contains all the information the API
        // will need to verify the token and identify the user.
        sessionStorage.setItem('auth:token', authResult.idToken);

        // Store the token expiration to allow warning the user that their session
        // is about to expire.
        sessionStorage.setItem('auth:expires', new Date(authResult.idTokenPayload.exp * 1000).toString());

        // Force redirect to remove auth hash from the URL
        window.location = window.location.href.substr(0, window.location.href.indexOf('#'));
      });
    }

    auth.authorize({ connection: 'google-oauth2' });
  },
});
