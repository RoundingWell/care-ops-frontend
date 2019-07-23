import _ from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/patients/sidebar/action-sidebar_views';
import { ActivitiesView, TimestampsView } from 'js/views/patients/sidebar/action-sidebar-activity-views';

export default App.extend({
  onBeforeStart({ action }) {
    if (this.isRestarting()) return;
    this.action = action;

    this.showView(new LayoutView({ model: this.action.clone() }));
  },
  beforeStart() {
    if (this.action.isNew()) return;
    return Radio.request('entities', 'fetch:actionEvents:collection', this.action.id);
  },
  onStart(options, activity) {
    this.activity = activity;

    this.showActivity();
  },
  showActivity() {
    if (this.action.isNew()) return;
    this.showChildView('activity', new ActivitiesView({ collection: this.activity }));
    const createdEvent = this.activity.find({ type: 'ActionCreated' });

    this.showChildView('timestamps', new TimestampsView({ model: this.action, createdEvent }));
  },
  viewEvents: {
    'save': 'onSave',
    'cancel': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    this.action.save(model.attributes).then(_.bind(this.restart, this));
  },
  onDelete() {
    this.action.destroy();
    this.stop();
  },
  onStop() {
    if (this.isRestarting()) return;

    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
});
