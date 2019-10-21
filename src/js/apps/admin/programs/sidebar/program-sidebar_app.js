import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/programs/sidebar/programs-sidebar_views';

export default App.extend({
  onBeforeStart({ program }) {
    this.program = program;

    this.showView(new LayoutView({
      program: this.program,
    }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    this.program.save(model.attributes)
      .then(() => {
        Radio.request('sidebar', 'close');
      }, ({ responseJSON }) => {
        // TODO: display errors in form
        // const errors = this.program.parseErrors(responseJSON);
      });
  },
  onStop() {
    if (this.program && this.program.isNew()) this.program.destroy();

    Radio.request('sidebar', 'close');
  },
});
