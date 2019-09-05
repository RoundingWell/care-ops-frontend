import $ from 'jquery';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { logout } from 'js/auth';

export default App.extend({
  channelName: 'auth',
  radioRequests: {
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'logout': logout,
    'bootstrap': 'initBootstrap',
  },
  initialize({ token }) {
    $.ajaxSetup({
      contentType: 'application/vnd.api+json',
      statusCode: {
        401: logout,
        403: logout,
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
  initBootstrap() {
    const d = $.Deferred();
    const fetchCurrentUser = Radio.request('entities', 'fetch:clinicians:current');
    const fetchGroups = Radio.request('entities', 'fetch:groups:collection');
    const fetchRoles = Radio.request('entities', 'fetch:roles:collection');
    const fetchStates = Radio.request('entities', 'fetch:states:collection');
    $.when(fetchCurrentUser, fetchRoles, fetchStates, fetchGroups).done((currentUser, roles, states) => {
      this.currentUser = currentUser;
      this.currentOrg = Radio.request('entities', 'organizations:model', {
        states: states[0],
        roles: roles[0],
      });
      d.resolve(currentUser);
    });
    return d.promise();
  },
});
