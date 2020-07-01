import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';
import { BulkEditBodyView, BulkEditActionsHeaderView, BulkEditFlowsHeaderView } from 'js/views/patients/worklist/bulk-edit/bulk-edit_views';

const StateModel = Backbone.Model.extend({
  initialize() {
    this.initBulkState();
    this.initBulkOwner();
    this.initBulkGroups();
    this.initBulkDueDate();
    this.initBulkDueTime();
    this.initBulkDuration();
  },
  initBulkState() {
    const collection = this.get('collection');
    const stateId = collection.at(0).getState().id;
    const stateMulti = collection.some(item => {
      return item.getState().id !== stateId;
    });

    this.set({
      stateMulti,
      stateId: stateMulti ? null : stateId,
    });
  },
  initBulkOwner() {
    const collection = this.get('collection');
    const owner = collection.at(0).getOwner();
    const ownerMulti = collection.some(item => {
      return item.getOwner().id !== owner.id;
    });

    this.set({
      ownerMulti,
      owner: ownerMulti ? null : owner,
    });
  },
  initBulkGroups() {
    const patients = new Backbone.Collection();
    
    this.get('collection').each(item => {
      patients.add(item.getPatient());
    });
    
    const groups = patients.at(0).getGroups();

    patients.each(patient => {
      const patientGroups = patient.getGroups();
      const intersectedGroups = _.intersection(patientGroups.models, groups.models);

      groups.reset(intersectedGroups);
    });

    this.set({ groups });
  },
  initBulkDueDate() {
    const collection = this.get('collection');
    const date = collection.at(0).get('due_date');
    const dateMulti = collection.some(item => {
      return item.get('due_date') !== date;
    });

    this.set({
      dateMulti,
      date: dateMulti ? null : date,
    });
  },
  initBulkDueTime() {
    const collection = this.get('collection');
    const time = collection.at(0).get('due_time');
    const timeMulti = collection.some(item => {
      return item.get('due_time') !== time;
    });

    this.set({
      timeMulti,
      time: timeMulti ? null : time,
    });
  },
  initBulkDuration() {
    const collection = this.get('collection');
    const duration = collection.at(0).get('duration');
    const durationMulti = collection.some(item => {
      return item.get('duration') !== duration;
    });

    this.set({
      durationMulti,
      duration: durationMulti ? null : duration,
    });
  },
});

export default App.extend({
  StateModel,
  onStart({ isFlow }) {
    this.isFlow = isFlow;

    this.showSidebarModal();
  },
  showSidebarModal() {
    const selected = this.getState();
    const headerViewClass = this.isFlow ? BulkEditFlowsHeaderView : BulkEditActionsHeaderView;
    const headerView = new headerViewClass({
      collection: selected,
    });

    /* const modal = */Radio.request('modal', 'show:sidebar', {
      className: 'modal--sidebar bulk-edit',
      headerView,
      bodyView: new BulkEditBodyView({
        model: this.getState(),
      }),
    });

    this.listenTo(headerView, {
      'delete'(collection) {
        this.onBulkDelete(collection);
        modal.destroy();
        this.stop();
      },
    });
  },
});
