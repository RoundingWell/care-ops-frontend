import { includes, reject } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import getWorkspaceRoute from 'js/utils/root-route';

import App from 'js/base/app';

import SettingsService from './settings';
import WidgetsService from './widgets';
import WorkspaceService from './workspace';

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
    'workspaces': 'getWorkspaces',
    'organization': 'getOrganization',
    'roles': 'getActiveRoles',
    'teams': 'getTeams',
    'fetch': 'fetchBootstrap',
  },
  getCurrentUser() {
    return this.currentUser;
  },
  getOrganization() {
    return this.organization;
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
  initialize({ name }) {
    this.organization = new Backbone.Model({ name });

    // NOTE: handle pre-init'd workspace requests
    Radio.reply('workspace', 'current');
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:clinicians:current'),
      Radio.request('entities', 'fetch:roles:collection'),
      Radio.request('entities', 'fetch:teams:collection'),
      Radio.request('entities', 'fetch:workspaces:collection'),
      Radio.request('entities', 'fetch:settings:collection'),
      Radio.request('entities', 'fetch:widgets:collection'),
    ];
  },
  onStart(options, currentUser, roles, teams, workspaces, settings, widgets) {
    this.currentUser = currentUser;
    this.roles = roles;
    this.teams = teams;
    this.workspaces = workspaces;

    new SettingsService({ settings });

    new WidgetsService({ widgets });

    Radio.reset('workspace');
    new WorkspaceService({ route: getWorkspaceRoute() });

    this.resolvePromise(currentUser);
  },
  onFail(options, ...args) {
    this.rejectPromise(...args);
  },
  fetchBootstrap() {
    const promise = new Promise((resolvePromise, rejectPromise) => {
      this.resolvePromise = resolvePromise;
      this.rejectPromise = rejectPromise;
    });

    this.start();

    return promise;
  },
});
