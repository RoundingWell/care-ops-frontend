import { get, includes, reject, invoke, map, compact } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import store from 'store';

import getWorkspaceRoute from 'js/utils/root-route';

import App from 'js/base/app';

import SettingsService from './settings';
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
    'currentWorkspace': 'getCurrentWorkspace',
    'setCurrentWorkspace': 'setCurrentWorkspace',
    'workspaces': 'getWorkspaces',
    'organization': 'getOrganization',
    'directories': 'getDirectories',
    'setDirectories': 'setDirectories',
    'roles': 'getActiveRoles',
    'teams': 'getTeams',
    'sidebarWidgets': 'getSidebarWidgets',
    'sidebarWidgets:fields': 'getSidebarWidgetFields',
    'widgets': 'getWidgets',
    'fetch': 'fetchBootstrap',
  },
  getCurrentUser() {
    return this.currentUser;
  },
  _getWorkspace(slug) {
    const workspaces = this.currentUser.getWorkspaces();

    if (!workspaces.length) throw 'No workspaces found';

    return workspaces.find({ slug })
      || workspaces.find({ id: store.get('currentWorkspace') })
      || workspaces.at(0);
  },
  getCurrentWorkspace() {
    return this.currentWorkspace;
  },
  setCurrentWorkspace(route) {
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
  getOrganization() {
    return this.organization;
  },
  getDirectories() {
    return this.directories.clone();
  },
  setDirectories(directories) {
    this.directories = directories;
  },
  getWorkspaces() {
    return this.workspaces.clone();
  },
  // Returns roles that the current user can manage
  getActiveRoles() {
    if (activeRolesCache) return activeRolesCache;

    const canAdmin = this.currentUser.can('clinicians:admin');
    const activeRoles = getActiveRoles(this.roles, canAdmin);

    activeRolesCache = Radio.request('entities', 'roles:collection', activeRoles);

    return activeRolesCache;
  },
  getTeams() {
    return this.teams.clone();
  },
  getWidgets() {
    return this.widgets.clone();
  },
  getSidebarWidgets() {
    const sidebarWidgets = get(this.getSetting('widgets_patient_sidebar'), 'widgets');

    const widgets = map(sidebarWidgets, slug => {
      return this.widgets.find({ slug });
    });

    return Radio.request('entities', 'widgets:collection', invoke(compact(widgets), 'omit', 'id'));
  },
  getSidebarWidgetFields() {
    return get(this.getSetting('widgets_patient_sidebar'), 'fields');
  },
  initialize({ name }) {
    this.bootstrapPromise = new Promise((resolvePromise, rejectPromise) => {
      this.resolveBootstrap = resolvePromise;
      this.rejectBootstrap = rejectPromise;
    });
    this.organization = new Backbone.Model({ name });
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:clinicians:current'),
      Radio.request('entities', 'fetch:roles:collection'),
      Radio.request('entities', 'fetch:teams:collection'),
      Radio.request('entities', 'fetch:settings:collection'),
      Radio.request('entities', 'fetch:workspaces:collection'),
      Radio.request('entities', 'fetch:widgets:collection'),
    ];
  },
  onStart(options, currentUser, roles, teams, settings, workspaces, widgets) {
    this.currentUser = currentUser;
    this.roles = roles;
    this.teams = teams;
    this.workspaces = workspaces;
    this.widgets = widgets;

    this.setCurrentWorkspace();
    new SettingsService({ settings });

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
