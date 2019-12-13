import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView } from 'js/views/admin/sidebar/flow/flow-sidebar_views';

const i18n = intl.admin.sidebar.flow.flowSidebarApp;

export default App.extend({
  onBeforeStart({ flow, programId }) {
    this.flow = flow;
    this.programId = programId;
    this.flow.trigger('editing', true);

    this.showView(new LayoutView({
      flow: this.flow,
    }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    if (model.isNew()) {
      this.flow.saveAll(model.attributes).done(() => {
        Radio.trigger('event-router', 'program:flow', this.flow.id, this.programId);
      });
      return;
    }

    this.flow.save(model.pick('name', 'details'));
  },
  onDelete() {
    const _this = this;
    Radio.request('modal', 'show:small', {
      bodyText: i18n.deleteModal.bodyText,
      headingText: i18n.deleteModal.headingText,
      submitText: i18n.deleteModal.submitText,
      buttonClass: 'button--red',
      onSubmit() {
        _this.flow.destroy();
        Radio.trigger('event-router', 'program:details', _this.programId);
        this.destroy();
      },
    });
  },
  onStop() {
    if (this.flow && this.flow.isNew()) this.flow.destroy();
    this.flow.trigger('editing', false);
    Radio.request('sidebar', 'close');
  },
});
