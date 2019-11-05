import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/sidebar/program/programs-sidebar_views';

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
  },
  onSave({ model }) {
    const isNew = this.program.isNew();
    this.program.save(model.pick('name', 'details'))
      .then(() => {
        if (isNew) Radio.request('sidebar', 'close');
      }, ({ responseJSON }) => {
        const errors = this.program.parseErrors(responseJSON);
        this.getView().showErrors(errors);
      });
  },
  onStop() {
    if (this.program && this.program.isNew()) this.program.destroy();

    Radio.request('sidebar', 'close');
  },
});
