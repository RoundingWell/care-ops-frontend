import Radio from 'backbone.radio';

import App from 'js/base/app';

import { SidebarView } from 'js/views/admin/sidebar/clinician/clinician-sidebar_views';

export default App.extend({
  onBeforeStart({ clinician }) {
    this.clinician = clinician;

    this.showView(new SidebarView({
      model: this.clinician,
    }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    this.clinician.save(model.attributes).done(() => {
      Radio.trigger('event-router', 'clinician', this.clinician.id);
    });
  },
  // onDelete() {
  //   this.clinician.trigger('editing', false);
  //   this.clinician.destroy();
  //   this.stop();
  // },
  onStop() {
    this.clinician.trigger('editing', false);
    if (this.clinician && this.clinician.isNew()) this.clinician.destroy();

    Radio.request('sidebar', 'close');
    Radio.trigger('event-router', 'clinicians:all');
  },
});
