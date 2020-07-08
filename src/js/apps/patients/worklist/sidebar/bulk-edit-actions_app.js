import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';
import { BulkEditActionsBodyView, BulkEditActionsHeaderView } from 'js/views/patients/worklist/bulk-edit/bulk-edit_views';

const StateModel = Backbone.Model.extend({
  initialize({ collection }) {
    const initModel = collection.at(0);
    this.initBulkState(collection, initModel);
    this.initBulkOwner(collection, initModel);
    this.initBulkDueDate(collection, initModel);
    this.initBulkDueTime(collection, initModel);
    this.initBulkDuration(collection, initModel);
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
  initBulkDueDate(collection, initModel) {
    const date = initModel.get('due_date');
    const dateMulti = collection.some(item => {
      return item.get('due_date') !== date;
    });

    this.set({
      dateMulti,
      date: dateMulti ? null : date,
    });
  },
  initBulkDueTime(collection, initModel) {
    const time = initModel.get('due_time');
    const timeMulti = collection.some(item => {
      return item.get('due_time') !== time;
    });

    this.set({
      timeMulti,
      time: timeMulti ? null : time,
    });
  },
  initBulkDuration(collection, initModel) {
    const duration = initModel.get('duration');
    const durationMulti = collection.some(item => {
      return item.get('duration') !== duration;
    });

    this.set({
      durationMulti,
      duration: durationMulti ? null : duration,
    });
  },
  getGroups() {
    return this.get('collection').getPatients().getSharedGroups();
  },
  getData() {
    const {
      stateMulti,
      stateId,
      ownerMulti,
      owner,
      dateMulti,
      date,
      timeMulti,
      time,
      durationMulti,
      duration,
    } = this.attributes;

    const saveData = {};

    if (!stateMulti) saveData._state = stateId;
    if (!ownerMulti) saveData._owner = _.pick(owner, 'id', 'type');
    if (!dateMulti) saveData.due_date = date;
    if (!timeMulti) saveData.due_time = time;
    if (!durationMulti) saveData.duration = duration;

    return saveData;
  },
});

export default App.extend({
  StateModel,
  onStart() {
    const headerView = new BulkEditActionsHeaderView({ 
      collection: this.getState('collection'),
    });
    const bodyView = new BulkEditActionsBodyView({
      model: this.getState(),
      collection: this.getState('collection'),
    });

    this.modal = Radio.request('modal', 'show:sidebar', {
      className: 'modal--sidebar bulk-edit',
      headerView,
      bodyView,
      onSubmit: this.onSubmit.bind(this),
    });

    this.listenTo(headerView, {
      'delete': _.partial(this.triggerMethod, 'delete'),
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
