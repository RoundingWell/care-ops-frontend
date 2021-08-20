import { partial, pick } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';
import { BulkEditFlowsBodyView, BulkEditFlowsHeaderView } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';

const StateModel = Backbone.Model.extend({
  initialize({ collection }) {
    const initModel = collection.at(0);
    this.initBulkState(collection, initModel);
    this.initBulkOwner(collection, initModel);
  },
  initBulkState(collection, initModel) {
    const stateId = initModel.getState().id;
    const stateMulti = collection.some(item => {
      return item.getState().id !== stateId;
    });

    this.set({
      stateMulti,
      stateId: stateMulti ? null : stateId,
    });
  },
  initBulkOwner(collection, initModel) {
    const owner = initModel.getOwner();
    const ownerMulti = collection.some(item => {
      return item.getOwner().id !== owner.id;
    });

    this.set({
      ownerMulti,
      owner: ownerMulti ? null : owner,
    });
  },
  setState(state) {
    return this.set({ stateId: state.id, stateMulti: false, stateChanged: true });
  },
  setOwner(owner) {
    return this.set({ owner, ownerMulti: false, ownerChanged: true });
  },
  getGroups() {
    return this.get('collection').getPatients().getSharedGroups();
  },
  someComplete() {
    return this.get('collection').some(item => {
      return item.isDone();
    });
  },
  getData() {
    const {
      stateChanged,
      stateId,
      ownerChanged,
      owner,
    } = this.attributes;

    const saveData = {};

    if (stateChanged) saveData._state = stateId;
    if (ownerChanged) saveData._owner = pick(owner, 'id', 'type');

    return saveData;
  },
});

export default App.extend({
  StateModel,
  onStart() {
    const headerView = new BulkEditFlowsHeaderView({
      collection: this.getState('collection'),
    });
    const bodyView = new BulkEditFlowsBodyView({
      model: this.getState(),
      collection: this.getState('collection'),
    });

    this.modal = Radio.request('modal', 'show:sidebar', {
      headerView,
      bodyView,
      onSubmit: this.onSubmit.bind(this),
    });

    this.listenTo(headerView, {
      'delete': partial(this.triggerMethod, 'delete'),
    });

    this.listenTo(this.modal, {
      'destroy': this.stop,
    });
  },
  onSubmit() {
    this.triggerMethod('save', this.getState().getData());
  },
  onStop() {
    this.modal.destroy();
  },
});
