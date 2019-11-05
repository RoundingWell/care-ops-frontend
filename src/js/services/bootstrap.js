import $ from 'jquery';
import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'bootstrap',
  radioRequests: {
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'fetch': 'fetchBootstrap',
  },
  initialize({ name }) {
    this.currentOrg = Radio.request('entities', 'organizations:model', { name });
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  fetchBootstrap() {
    const d = $.Deferred();
    const fetchCurrentUser = Radio.request('entities', 'fetch:clinicians:current');
    const fetchGroups = Radio.request('entities', 'fetch:groups:collection');
    const fetchRoles = Radio.request('entities', 'fetch:roles:collection');
    const fetchStates = Radio.request('entities', 'fetch:states:collection');
    $.when(fetchCurrentUser, fetchRoles, fetchStates, fetchGroups).done(([currentUser], [roles], [states]) => {
      this.currentUser = currentUser;
      this.currentOrg.set({ states, roles });
      d.resolve(currentUser);
    });
    return d.promise();
  },
});
