import Backbone from 'backbone';

import App from 'js/base/app';

let bearer;

/* istanbul ignore if */
// FIXME: Added production until SSO is available
if (_DEVELOP_ || _PRODUCTION_) {
  // https://git.io/fjEMo
  bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGluaWNpYW4iOiJlNDkyZjA3Yy1mZjRmLTRkOTEtOTNhYS1hN2VkMGEwZWQzYTEifQ.5tan08SQx3vmSPkj4HzX0sjBC__SlNfEWr3TNWomQHc';
}

export default App.extend({
  channelName: 'auth',
  radioRequests: {
    'ajaxAuth': 'getAjaxAuth',
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'bootstrap': 'initBootstrap',
  },
  getAjaxAuth() {
    return {
      beforeSend(request) {
        request.setRequestHeader('Authorization', `Bearer ${ bearer }`);
      },
    };
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  initBootstrap() {
    // TODO: Radio request(s) for preloaded model cache at login
    // Should set currentUser, currentOrg and any other explicit non-relation cache here
    // Should return a single Promise

    // FIXME: should be a clinician model
    this.currentUser = new Backbone.Model();

    // FIXME: should be an organization model
    this.currentOrg = new Backbone.Model();
  },
});
