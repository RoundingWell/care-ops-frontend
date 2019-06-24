import $ from 'jquery';
import Radio from 'backbone.radio';

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
    const d = $.Deferred();

    $.when(Radio.request('entities', 'fetch:temporary:bootstrap')).then(currentUser => {
      this.currentUser = currentUser;
      this.currentOrg = this.currentUser.getOrganization();
      d.resolve(currentUser);
    });

    return d;
  },
});
