import Radio from 'backbone.radio';

import App from 'js/base/app';

import { SidebarView } from 'js/views/clinicians/sidebar/clinician-sidebar_views';

export default App.extend({
  onBeforeStart({ clinician }) {
    this.clinician = clinician;

    this.showView(new SidebarView({ clinician }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
  },
  onSave({ model }) {
    this.clinician.save(model.attributes).then(() => {
      Radio.trigger('event-router', 'clinician', this.clinician.id);
    }, ({ responseJSON }) => {
      const errors = this.clinician.parseErrors(responseJSON);
      this.getView().showErrors(errors);
    });
  },
  onStop() {
    this.clinician.trigger('editing', false);

    Radio.request('sidebar', 'close');
    Radio.trigger('event-router', 'clinicians:all');
  },
});
