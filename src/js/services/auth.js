import $ from 'jquery';
import _ from 'underscore';
import moment from 'moment';
import auth0 from 'auth0-js';
import Radio from 'backbone.radio';

import App from 'js/base/app';

let token;
let expires;

function clearHash() {
  window.history.replaceState('', document.title, window.location.pathname + window.location.search);
}

function getSessionExpires() {
  const sessionExpires = sessionStorage.getItem('auth:expires');

  return sessionExpires && moment.unix(sessionExpires).utc();
}

export default App.extend({
  channelName: 'auth',
  radioRequests: {
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'isTokenValid': 'isTokenValid',
    'login': 'login',
    'logout': 'logout',
    'bootstrap': 'initBootstrap',
  },
  initialize() {
    $.ajaxSetup({
      contentType: 'json',
      statusCode: {
        401: _.bind(this.logout, this),
        403: _.bind(this.logout, this),
      },
      beforeSend(request) {
        request.setRequestHeader('Authorization', `Bearer ${ token }`);
      },
    });
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  login(success = _.noop) {
    token = sessionStorage.getItem('auth:token');
    expires = getSessionExpires();

    if (this.isTokenValid()) return success();

    this.removeToken();

    // https://auth0.com/docs/libraries/auth0js/v9#webauth-authorize-
    const auth = new auth0.WebAuth({
      clientID: '2eg7mz2db0B31gctULMTcgax1vdvgPip',
      domain: 'roundingwell-care-team.auth0.com',
      responseType: 'id_token',
      responseMode: 'fragment',
      redirectUri: window.location.origin,
    });

    if (!window.location.hash) {
      auth.authorize({ connection: 'google-oauth2' });
      return;
    }

    // https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
    auth.parseHash({}, (authErr, authResult) => {
      clearHash();

      if (authErr) {
        // eslint-disable-next-line no-console
        console.error(authErr);
        this.logout();
      }

      // We use ID Token (JWT) because it contains all the information the API
      // will need to verify the token and identify the user.
      sessionStorage.setItem('auth:token', authResult.idToken);
      token = authResult.idToken;

      // Store the token expiration to allow warning the user that their session
      // is about to expire.
      sessionStorage.setItem('auth:expires', authResult.idTokenPayload.exp);
      expires = getSessionExpires();

      success();
    });
  },
  logout() {
    this.removeToken();
    // TODO: This may need a proper login/logout page.
    window.location.reload();
  },
  isTokenValid(atDate, unit) {
    return expires && expires.isAfter(atDate, unit);
  },
  removeToken() {
    token = null;
    expires = null;
    sessionStorage.removeItem('auth:token');
    sessionStorage.removeItem('auth:expires');
  },
  initBootstrap() {
    const d = $.Deferred();
    $.when(Radio.request('entities', 'fetch:clinicians:current')).then(currentUser => {
      this.currentUser = currentUser;
      this.currentOrg = this.currentUser.getOrganization();

      const groupRequests = this.currentOrg.getGroups().map(group => {
        return Radio.request('entities', 'fetch:clinicians:byGroup', group);
      });

      $.when(...groupRequests).done(() => {
        d.resolve(currentUser);
      });
    });
    return d.promise();
  },
});
