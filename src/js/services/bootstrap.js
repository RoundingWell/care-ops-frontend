import { get, includes, reject } from 'underscore';
import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';

import App from 'js/base/app';

// NOTE: Roles are set only at login so they can be cached
let activeRolesCache;

function getActiveRoles(roles, canAdmin) {
  const activeRoles = roles.reject({ name: 'patient' });

  if (canAdmin) return activeRoles;

  return reject(activeRoles, role => {
    return includes(role.get('permissions'), 'clinicians:admin');
  });
}

export default App.extend({
  channelName: 'bootstrap',
  radioRequests: {
    'currentUser': 'getCurrentUser',
    'currentOrg': 'getCurrentOrg',
    'currentOrg:setting': 'getOrgSetting',
    'currentOrg:roles': 'getOrgRoles',
    'sidebarWidgets': 'getSidebarWidgets',
    'sidebarWidgets:fields': 'getSidebarWidgetFields',
    'fetch': 'fetchBootstrap',
  },
  initialize({ name }) {
    this.bootstrapPromise = new Promise((resolvePromise, rejectPromise) => {
      this.resolveBootstrap = resolvePromise;
      this.rejectBootstrap = rejectPromise;
    });
    this.currentOrg = Radio.request('entities', 'organizations:model', { name });
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getOrgRoles() {
    if (activeRolesCache) return activeRolesCache;

    const roles = this.getCurrentOrg().get('roles');
    const canAdmin = this.currentUser.can('clinicians:admin');
    const activeRoles = getActiveRoles(roles, canAdmin);

    activeRolesCache = Radio.request('entities', 'roles:collection', activeRoles);

    return activeRolesCache;
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
      Radio.request('entities', 'fetch:roles:collection'),
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
      Radio.request('entities', 'fetch:settings:model'),
      Radio.request('entities', 'fetch:directories:filterable'),
      Radio.request('entities', 'fetch:workspaces:collection'),
      Radio.request('entities', 'fetch:clinicians:collection'),
      Radio.request('entities', 'fetch:widgets:collection'),
    ];
  },
  onStart(options, currentUser, teams, roles, states, forms, settings, directories) {
    this.currentUser = currentUser;
    this.currentOrg.set({ states, teams, forms, settings, roles, directories });
    this.resolveBootstrap(currentUser);
  },
  onFail(options, ...args) {
    this.rejectBootstrap(...args);
  },
  fetchBootstrap() {
    this.start();

    return this.bootstrapPromise;
  },
});
