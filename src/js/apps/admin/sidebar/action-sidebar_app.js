import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, FormSharingButtonView, FormSharingView } from 'js/views/admin/sidebar/action/action-sidebar_views';

export default App.extend({
  onBeforeStart({ action }) {
    this.action = action;

    this.showView(new LayoutView({
      action: this.action,
    }));
  },
  onStart() {
    this.showFormSharing();

    this.listenTo(this.action, 'change:_form change:outreach', this.showFormSharing);
  },
  showFormSharing() {
    if (!Radio.request('bootstrap', 'currentOrg:setting', 'care_team_outreach')) return;

    const form = this.action.getForm();

    if (!form) {
      this.showChildView('formSharing', new FormSharingButtonView({ isDisabled: true }));
      return;
    }

    if (this.action.get('outreach') === 'disabled') {
      const button = new FormSharingButtonView();

      this.listenTo(button, 'click', () => {
        this.action.save({ outreach: 'patient' });
      });

      this.showChildView('formSharing', button);
      return;
    }

    const formSharingView = new FormSharingView();

    this.listenTo(formSharingView, 'click', () => {
      this.action.save({ outreach: 'disabled' });
    });

    this.showChildView('formSharing', formSharingView);
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
    'click:form': 'onClickForm',
  },
  onSave({ model }) {
    if (model.isNew()) {
      this.action.saveAll(model.attributes)
        .done(() => {
          const flowId = this.action.get('_program_flow');

          if (flowId) {
            Radio.trigger('event-router', 'programFlow:action', flowId, this.action.id);
            return;
          }

          Radio.trigger('event-router', 'program:action', this.action.get('_program'), this.action.id);
        });
      return;
    }

    this.action.save(model.pick('name', 'details'));
  },
  onDelete() {
    this.action.destroy({ wait: true })
      .done(() => {
        this.stop();
      })
      .fail(({ responseJSON }) => {
        Radio.request('alert', 'show:apiError', responseJSON);
      });
  },
  onStop() {
    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
  onClickForm(form) {
    Radio.trigger('event-router', 'form:preview', form.id);
  },
});
