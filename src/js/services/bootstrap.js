import { get, includes, reject } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import store from 'store';

import collectionOf from 'js/utils/formatting/collection-of';
import getWorkspaceRoute from 'js/utils/root-route';

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
    'currentWorkspace': 'getCurrentWorkspace',
    'setCurrentWorkspace': 'setCurrentWorkspace',
    'roles:active': 'getActiveRoles',
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
  _getWorkspace(slug) {
    const workspaces = this.currentUser.getWorkspaces();

    return workspaces.find({ slug })
      || workspaces.find({ id: store.get('currentWorkspace') })
      || workspaces.at(0);
  },
  getCurrentWorkspace() {
    return this.currentWorkspace;
  },
  setCurrentWorkspace(route) {
    if (!this.isRunning()) return;

    const workspaceRoute = route || getWorkspaceRoute();

    if (this.currentWorkspace && !workspaceRoute) {
      return this.currentWorkspace;
    }

    const workspace = this._getWorkspace(workspaceRoute);

    if (workspace.id !== get(this.currentWorkspace, 'id')) {
      store.set('currentWorkspace', workspace.id);
      this.currentWorkspace = workspace;
      this.getChannel().trigger('change:workspace', workspace);
    }

    return workspace;
  },
  // Returns roles that the current user can manage
  getActiveRoles() {
    if (activeRolesCache) return activeRolesCache;

    const canAdmin = this.currentUser.can('clinicians:admin');
    const activeRoles = getActiveRoles(this.roles, canAdmin);

    activeRolesCache = Radio.request('entities', 'roles:collection', activeRoles);

    return activeRolesCache;
  },
  getCurrentOrg() {
    return this.currentOrg;
  },
  getOrgSetting(settingName) {
    const setting = this.getCurrentOrg().getSetting(settingName);
    if (!setting) return;
    return setting.get('value');
  },
  getSidebarWidgets() {
    const sidebarWidgets = get(this.getOrgSetting('widgets_patient_sidebar'), 'widgets');

    return Radio.request('entities', 'widgets:collection', collectionOf(sidebarWidgets, 'id'));
  },
  getSidebarWidgetFields() {
    return get(this.getOrgSetting('widgets_patient_sidebar'), 'fields');
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:clinicians:current'),
      Radio.request('entities', 'fetch:teams:collection'),
      Radio.request('entities', 'fetch:roles:collection'),
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
      Radio.request('entities', 'fetch:settings:collection'),
      Radio.request('entities', 'fetch:directories:filterable'),
      Radio.request('entities', 'fetch:workspaces:collection'),
      Radio.request('entities', 'fetch:clinicians:collection'),
      Radio.request('entities', 'fetch:widgets:collection'),
    ];
  },
  onStart(options, currentUser, teams, roles, states, forms, settings, directories) {
    this.currentUser = currentUser;
    this.currentOrg.set({ states, teams, forms, settings, roles, directories });
    this.setCurrentWorkspace();

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
