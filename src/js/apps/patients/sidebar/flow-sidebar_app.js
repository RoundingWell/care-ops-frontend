import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView } from 'js/views/patients/sidebar/flow/flow-sidebar_views';
import { ActivitiesView } from 'js/views/patients/sidebar/flow/flow-sidebar-activity-views';

const i18n = intl.patients.sidebar.flow.flowSidebarApp;

export default App.extend({
  onBeforeStart({ flow }) {
    this.flow = flow;

    this.showView(new LayoutView({
      model: this.flow,
    }));
  },
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:flowEvents:collection', this.flow.id),
      Radio.request('entities', 'fetch:programs:model:byFlow', this.flow.id),
    ];
  },
  onStart(options, [activity] = []) {
    this.showChildView('activity', new ActivitiesView({ collection: activity, model: this.flow }));
  },
  viewEvents: {
    'close': 'stop',
    'delete': 'onDelete',
  },
  onDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.deleteModal.bodyText,
      headingText: i18n.deleteModal.headingText,
      submitText: i18n.deleteModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        this.flow.destroy();
        Radio.trigger('event-router', 'patient:dashboard', this.flow.get('_patient'));
        modal.destroy();
      },
    });
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
