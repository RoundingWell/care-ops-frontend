import $ from 'jquery';
import { get } from 'underscore';
import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';

import App from 'js/base/app';

export default App.extend({
  channelName: 'bootstrap',
  radioRequests: {
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'currentOrg:setting': 'getOrgSetting',
    'sidebarWidgets': 'getSidebarWidgets',
    'sidebarWidgets:fields': 'getSidebarWidgetFields',
    'fetch': 'fetchBootstrap',
  },
  initialize({ name }) {
    this.bootstrapPromise = $.Deferred();
    this.currentOrg = Radio.request('entities', 'organizations:model', { name });
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  getOrgSetting(settingName) {
    return this.getCurrentOrg().getSetting(settingName);
  },
  getSidebarWidgets() {
    const sidebarWidgets = get(this.getCurrentOrg().getSetting('widgets_patient_sidebar'), 'widgets');

    return Radio.request('entities', 'widgets:collection', collectionOf(sidebarWidgets, 'id'));
  },
  getSidebarWidgetFields() {
    return get(this.getCurrentOrg().getSetting('widgets_patient_sidebar'), 'fields');
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:clinicians:current'),
      Radio.request('entities', 'fetch:teams:collection'),
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
      Radio.request('entities', 'fetch:settings:model'),
      Radio.request('entities', 'fetch:groups:collection'),
      Radio.request('entities', 'fetch:clinicians:collection'),
      Radio.request('entities', 'fetch:widgets:collection'),
    ];
  },
  onStart(options, [currentUser], [teams], [states], [forms], [settings]) {
    this.currentUser = currentUser;
    this.currentOrg.set({ states, teams, forms, settings });
    this.bootstrapPromise.resolve(currentUser);
  },
  onFail(options, ...args) {
    this.bootstrapPromise.reject(...args);
  },
  fetchBootstrap() {
    this.start();

    return this.bootstrapPromise;
  },
});
