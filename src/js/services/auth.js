import $ from 'jquery';
import Radio from 'backbone.radio';

import App from 'js/base/app';

let bearer;

/* istanbul ignore if */
// FIXME: Added production until SSO is available
if (_DEVELOP_ || _PRODUCTION_) {
  // https://git.io/fjEMo
  bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Imx1a2UubGFuY2FzdGVyQHJvdW5kaW5nd2VsbC5jb20ifQ.gsbE-XeIv1qjPrWQzKEI5ILi7iB5_WaE2-0QdVM_ICs';
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

    $.when(Radio.request('entities', 'fetch:clinicians:current')).then(currentUser => {
      this.currentUser = currentUser;
      this.currentOrg = this.currentUser.getOrganization();
      d.resolve(currentUser);
    });

    return d;
  },
});
