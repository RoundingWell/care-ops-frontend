let bearer;

/* istanbul ignore if */
if (_DEVELOP_) {
  // https://git.io/fjEMo
  bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGluaWNpYW4iOiJlNDkyZjA3Yy1mZjRmLTRkOTEtOTNhYS1hN2VkMGEwZWQzYTEifQ.5tan08SQx3vmSPkj4HzX0sjBC__SlNfEWr3TNWomQHc';
}

import App from 'js/base/app';

export default App.extend({
  channelName: 'auth',
  radioRequests: {
    'get:ajaxAuth': 'getAjaxAuth',
  },
  getAjaxAuth() {
    return {
      beforeSend(request) {
        request.setRequestHeader('Authorization', `Bearer ${ bearer }`);
      },
    };
  },
});
