import $ from 'jquery';
import Radio from 'backbone.radio';

import App from 'js/base/app';

let bearer;

/* istanbul ignore if */
// FIXME: Added production until SSO is available
if (_DEVELOP_ || _PRODUCTION_) {
  // https://git.io/fjEMo
  bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImRldiJ9.eyJpc3MiOjE1NjI2ODcwMTQsIm5iZiI6MTU2MjY4NzAxNCwiZXhwIjoxNTYyNjkwNjE0LCJlbWFpbCI6Imx1a2UubGFuY2FzdGVyQHJvdW5kaW5nd2VsbC5jb20ifQ.j-gcvDNb6UG3fyNNYvv-bB54FxESshAC3f28xoYX3Z3uMDpj0oBXj4vCHdllze33CvdzpPXeiknGO0kKkliha16nxZ9Bk7Fhwdc5RCOChtbVVDq7XmTIm3dyAtMutsPnupfqir89lD2b6VTiPgQBD6I2PxRq_snENUgFuzcq4k4VQo_OCW3DFAQlzx5lP7D-R2sCoGA342Ed1LLbwbG26vH8rI9FhBdFoW51vtetB3ad7knSjrgFLjpFJnHIW297mnDD6vAEu8eXIyHXrvSqR_U9x803rtcmsMqEqNeZ5XmlIQLB83c0YwfyeLmB6qgEt3d8oanL0FklVSy2qiVykJkSb6zfFMIMVSu8xbo12S_bBmxvDVveDeWQNRYXeKjeg44q9quT6zJJIKrNVLMg-i4g_rZpQ5NpXqzmO-WFAVPxXtsBF49v7gB6V-rESV7Qs-L152eaLG15h8Lav05ET0Aa7-wAiFEOCarEHwhkItdxvUEE7nBaoSl4-RMG9l465ki4PiiMM-Q0sfZoziNuqGOXsZYx-n4ylnziTvLPqXXoX-4J9wmF5axpNGvnPus6UM8WhFu6MXdbrztCpXGzg7cT5e7Hcvtx_uMs1xjxJ0ryO2Ii0dpCNF2-y6Ht6fyofUOoEVENbftSXorudHfmgvuZwC9_TU3EJP6D4sPo92o';
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
