import { get } from 'underscore';
import Radio from 'backbone.radio';
import store from 'store';

import App from 'js/base/app';

export default App.extend({
  channelName: 'workspace',
  radioRequests: {
    'current': 'getCurrentWorkspace',
    'directories': 'getDirectories',
    'fetch': 'fetchWorkspace',
  },
  _getWorkspace(slug) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const workspaces = currentUser.getWorkspaces();

    if (!workspaces.length) throw 'No workspaces found';

    return workspaces.find({ slug })
      || workspaces.find({ id: store.get('currentWorkspace') })
      || workspaces.at(0);
  },
  _setCurrentWorkspace(route) {
    if (this.currentWorkspace && !route) {
      return this.currentWorkspace;
    }

    const workspace = this._getWorkspace(route);

    if (workspace.id !== get(this.currentWorkspace, 'id')) {
      store.set('currentWorkspace', workspace.id);
      this.currentWorkspace = workspace;
      this.getChannel().trigger('change:workspace', workspace);
    }

    return workspace;
  },
  getCurrentWorkspace(route) {
    if (route) {
      return this._setCurrentWorkspace(route);
    }

    return this.currentWorkspace;
  },
  getDirectories() {
    return this.directories.clone();
  },
  initialize({ route }) {
    this._setCurrentWorkspace(route);
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:directories:filterable'),
      Radio.request('entities', 'fetch:clinicians:byWorkspace', this.currentWorkspace.id),
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
    ];
  },
  onStart(options, directories, clinicians) {
    this.directories = directories;

    this.currentWorkspace.updateClinicians(clinicians);

    this.resolvePromise(this.currentWorkspace);
  },
  onFail(options, ...args) {
    this.rejectPromise(...args);
  },
  fetchWorkspace() {
    const promise = new Promise((resolvePromise, rejectPromise) => {
      this.resolvePromise = resolvePromise;
      this.rejectPromise = rejectPromise;
    });

    if (this.isRunning()) {
      this.restart();

      return promise;
    }

    this.start();

    return promise;
  },
});
