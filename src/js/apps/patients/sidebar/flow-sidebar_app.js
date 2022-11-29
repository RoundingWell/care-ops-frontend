import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, getDeleteModal } from 'js/views/patients/sidebar/flow/flow-sidebar_views';
import { ActivitiesView } from 'js/views/patients/sidebar/flow/flow-sidebar-activity-views';

export default App.extend({
  onBeforeStart({ flow }) {
    this.flow = flow;
    this.flow.trigger('editing', true);

    this.showView(new LayoutView({
      model: this.flow,
    }));

    this.getRegion('activity').startPreloader();
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:flowEvents:collection', this.flow.id);
  },
  onStart(options, activity) {
    this.showChildView('activity', new ActivitiesView({ collection: activity, model: this.flow }));
  },
  viewEvents: {
    'close': 'stop',
    'delete': 'onDelete',
  },
  onDelete() {
    const modal = Radio.request('modal', 'show:small', getDeleteModal({
      onSubmit: () => {
        this.flow.destroy({ wait: true })
          .then(() => {
            Radio.trigger('event-router', 'patient:dashboard', this.flow.get('_patient'));
          })
          .catch(response => {
            Radio.request('alert', 'show:apiError', response.responseData);
          });
        modal.destroy();
      },
    }));
  },
  onStop() {
    this.flow.trigger('editing', false);
    Radio.request('sidebar', 'close');
  },
});
